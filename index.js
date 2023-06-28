import {TwingEnvironment, TwingLoaderArray} from 'twing'; // for use in the browser

// import our twig templates specifically
import baseTemplate from './templates/base.twig';
import jobsTemplate from './templates/jobs.twig';
import jobTemplate from './templates/job.twig';
import helloTemplate from './templates/parts/hello.twig';

// create the templates array for the loader to use
const templatesArray = {
	'base.twig': baseTemplate,
	'jobs.twig': jobsTemplate,
	'job.twig': jobTemplate,
	'hello.twig': helloTemplate
}

export default class smartjobboardFeed {

	#proxy;
	#proxy_url;
  #twing;

  constructor(id, url, params) {
    return (async () => {

      // inputs to class
      this.id = id; // string
      this.url = url; // string
      this.params = params; // array. conditional property if params are valid etc...
      this.remote = true; // TEMP

      this.target = document.getElementById(this.id);

      // private proerties
      this.#proxy = 'https://test.com/projects/xmlproxy/xmlproxy.php'; // string. 
      if (this.isFeedUrlValid()) this.#proxy_url = encodeURI(this.#proxy) + "?url=" + encodeURI(this.url);

      // new twing enironment
      this.#twing = new TwingEnvironment(new TwingLoaderArray(templatesArray));

      // run the Thing. do this last. this will check if things are alright, before doing fetchFeedAsHtmlHtml(), which uses fetchFeedAsJson()
      // if fetchFeedAsHtmlHtml() fails, it will print error saying failed to get feed html, i.e failed to render for some reason
      // if fetchFeedAsJson() fails, it will print json syntax or server error. if server is alive & gets valid json, it should succeed
      // if NOT isFeedTargetAvailable(), it should print error to say this
      // if NOT isFeedUrlValid(), it should print error to say this
      // if NOT isFeedParamsValid(), it should print error to say this
      // this.doTheThing();

      // set the statuses before anything happens
      this.status = {
        started: false, // if conditions are right for feed creation to be attempted
        created: false, // when feed has been created
        json_created: false, // when feed has been created
        json: null, // when feed has been created
        html_created: false, // when feed has been created
        html: null, // when feed has been created
        placed: false, // when feed hasa been placed into html
        error: null, // when feed has failed
      }

      this.helpMe();

      // Constructors return `this` implicitly, but this is an IIFE, so
      // return `this` explicitly (else we'd return an empty object).
      return this;

    })();
  }

  logParams() {
    console.log(this.params);
  }

  //
  // Test methods
  //

  logParams() {
    console.log(this.params);
  }

  //
  // Utility methods
  // should these be public, private, static etc...
  //

  isObjectWithData(obj){
    const isObjectEmpty = (_obj) => {
      return (
        _obj &&
        Object.keys(_obj).length === 0 &&
        _obj.constructor === Object
      );
    };
    const isObject = (_obj) => {
      return (
        _obj != null && 
        _obj.constructor.name === "Object"
      );
    };
    if(isObject(obj)){
      if(isObjectEmpty(obj)){
        return false;
      }
      return true;
    }
    return false;
  }

  //
  // Validation methods
  // should these be public, private, static etc...
  //

  isFeedTargetAvailable() {
    if(document.getElementById(this.id)) return true;
    return false;
  }
  isFeedUrlValid() {
    const isValidUrl = urlString=> {
      var urlPattern = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
      '(\\#[-a-z\\d_]*)?$','i'); // validate fragment locator
      return !!urlPattern.test(urlString);
    }
    if(this.url){
      if(isValidUrl(this.url)) return true;
    }
    return false;
  }
  isFeedParamsValid() {
    if(this.isObjectWithData(this.params)){
      return true;
    }
    return false;
  }

  //
  // Other methods
  // should these be public, private, static etc...
  //

  createContextFromJson(json) {
    let context = {};
    if(json.publisher) context.publisher = json.publisher;
    if(json.publisherurl) context.publisher_url = json.publisherurl;
    if(json.lastBuildDate) context.last_build_date = json.lastBuildDate;
    if(json.job) context.jobs = json.job;
    context.remote = this.remote;
    return context;
  }

  //
  // Output methods
  //

  // static staticMethod() {
  //   return 'static method has been called.';
  // }

  async getFeedHtml() {
    const blah = await this.status.thml;
    return blah;
  }

  getFeedJson(){
    if(this.status.json_created) return this.status.json;
  }

  getTheFeedHtml(){
    if(this.status.html_created) return this.status.html;
  }

  // get the feed as json data. returns a promise
  // so use .then on the other side.. like console.log() or render some other way on frontend
  // with error catching.. figure out how to best use it now
  async fetchFeedAsJson() {

    let json;

    try {
      const response = await fetch(this.#proxy_url);
      json = await response.json();
    }
    
    catch (error) {
      if (error instanceof SyntaxError) console.log('There was a SyntaxError (Unexpected token < in JSON).', error); // Unexpected token < in JSON
      console.log('There was an issue trying to reach the requested server.', error); // network error
    }
    
    if (json) return json; // promise returned

  }

  // get the feed as html markup, rendered using twig. returns a promise
  // so use .then on the other side.. then u can do what u want with it on frontend, usually place in DOM
  // uses fetchFeedAsHtmlAsJson()
  async fetchFeedAsHtml() {

    let json;
    let html;
    let data = {};

    try {
      const json = await this.fetchFeedAsJson();
      const context = this.createContextFromJson(json);
      json = json;
      html = await this.#twing.render('jobs.twig', context);
      if(json) data.json = json;
      if(html) data.html = html;
    }

    catch(error) {
      console.log('There was an error creating the feed html.');
    }

    if(data.json || data.html){
      return data;
    }
		
  }

  // get the json, render it using twig, place html into DOM, all conditionally.
  // uses fetchFeedAsHtmlAsHtml(), which uses fetchFeedAsHtmlAsJson()
  // call this method at end of class to fire on feed object init.
  // i guess no harm to be able to call on the other side
  doTheThing() {

    if(this.isFeedTargetAvailable());
    if(this.isFeedUrlValid());
    if(this.isFeedParamsValid());

    this.fetchFeedAsHtmlHtml()
    .then((html) => {
      console.log(html); // this.target.innerHTML = html;
    })

  }

  async initialize() {

    // this.responseJson = await fetchFeedAsJson();
    this.responseHtml = await fetchFeedAsHtml();

    // console.log('Class static initialization block called');

    // code to place the feed, depending on conditions, whilst setting the status along the way
    // should be run on object init
    // afterwards, methods which get the json or html for the end user separate....
    // should maybe just return values from here, rather than running the async methods again...
    // or just return the json/html as properties in status, rather than via methods, or both, fuck it.

    // console.log('Class static initialization block processed');

  }

  getStuff() {
    return this.responseHtml.data;
  }

  static async build () {
    var async_result = await fetchFeedAsHtml();
    return new smartjobboardFeed(async_result);
  }

  helpMe() {

    // console.log('Class static initialization block called');

    // code to place the feed, depending on conditions, whilst setting the status along the way
    // should be run on object init
    // afterwards, methods which get the json or html for the end user separate....
    // should maybe just return values from here, rather than running the async methods again...
    // or just return the json/html as properties in status, rather than via methods, or both, fuck it.
    if(this.isFeedUrlValid() && this.isFeedParamsValid()){

      // set the feed creation attempt status
      this.status.started = true;

      this.fetchFeedAsHtml()
      .then((data) => {

        // if we have json (errors get thrown when we dont or the server has issues)
        if(data.json){

          // set the json status
          this.status.json = data.json;
          this.status.json_created = true;

        } else {

          this.status.error = 'Feed has not been created due to an error in the feed source. Bad URL (invalid json) or server down.';

        }

        // if we have html (errors get thrown if issues generating the html via twig)
        if(data.html){

          // set the html status
          this.status.html = data.html;
          this.status.html_created = true;
          this.status.created = true;

          // if we have html AND target element is available, place the html & set that status too
          if(this.isFeedTargetAvailable){
            // this.target.innerHTML = data.html;
            this.status.placed = true;
          } 
          // else we set the error status & throw an error with the error status
          else {
            this.status.error = 'Feed has been created but not placed; a valid DOM element relating to the given ID could not be found.';
            // console.log(this.status.error);
          }

        } else {

          this.status.error = 'Feed has not been created due to an error in generating the Feed html.';
          if(data.json) this.status.error = 'Feed has not been created due to an error in generating the Feed html, tho the json data seems fine.';

        }

      })

    }

    // return new smartjobboardFeed()

    // console.log('Class static initialization block processed');

  }

}
window.smartjobboardFeed = smartjobboardFeed;

