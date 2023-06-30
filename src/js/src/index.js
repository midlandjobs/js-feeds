import UIkit from 'uikit'; // import uikit
import Icons from 'uikit/dist/js/uikit-icons'; // import uikit icons

UIkit.use(Icons); // use the Icon plugin
window.UIkit = UIkit; // Make uikit available in window for inline scripts

import { TwingEnvironment, TwingLoaderArray } from 'twing'; // for use in the browser

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

export default class MidlandJobsFeed {

	#proxy;
	#proxy_url;
	#twing;

	constructor(sel, url, params = { remote: false }) {

		// public
		this.el = document.querySelector(sel);;
		this.url = url;
		this.params = params;

		// private
		this.#proxy = 'https://test.com/projects/xmlproxy/xmlproxy.php';
		if (this.isFeedUrlValid()) this.#proxy_url = encodeURI(this.#proxy) + "?url=" + encodeURI(this.url);
		this.#twing = new TwingEnvironment(new TwingLoaderArray(templatesArray));

		// attempt to build the feed & place it
		(async () => {
			await this.buildFeedAll();
		})();

	}

	//
	// Utility methods
	// should these be public, private, static etc...
	//
	isObjectWithData(obj) {
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
		if (isObject(obj)) {
			if (isObjectEmpty(obj)) {
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
		if (document.getElementById(this.id)) return true;
		return false;
	}
	isFeedUrlValid() {
		const isValidUrl = urlString => {
			var urlPattern = new RegExp('^(https?:\\/\\/)?' + // validate protocol
				'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
				'((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
				'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
				'(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
				'(\\#[-a-z\\d_]*)?$', 'i'); // validate fragment locator
			return !!urlPattern.test(urlString);
		}
		if (this.url) {
			if (isValidUrl(this.url)) return true;
		}
		return false;
	}
	isFeedParamsValid() {
		if (this.isObjectWithData(this.params)) {
			return true;
		}
		return false;
	}
	isHtmlValid(html) {
		const regexForHTML = /<([A-Za-z][A-Za-z0-9]*)\b[^>]*>(.*?)<\/\1>/;
		let is_valid = regexForHTML.test(html);
		if (is_valid) return true
		return false;
	}
	isElementValid(el) {
		if (el && typeof (el) != 'undefined' && el != null) return true;
		return false;
	}

	//
	// Other methods
	// should these be public, private, static etc...
	//
	createContextFromJson(json) {
		let context = {};
		if (json.publisher) context.publisher = json.publisher;
		if (json.publisherurl) context.publisher_url = json.publisherurl;
		if (json.lastBuildDate) context.last_build_date = json.lastBuildDate;
		if (json.job) context.jobs = json.job;
		context.remote = this.params.remote;
		return context;
	}

	//
	// Output/Async methods
	// return promises/data
	// uses await
	// uses try/catch
	//

	// await fetchFeedJson & renderFeedJsonAsHtml. try/catch target ele & rendered html errors
	async buildFeedAll() {

		let json;
		let html;

		try {

			json = await this.fetchFeedJson();
			if (json) {
				html = await this.renderFeedJsonAsHtml(json);
				if (this.isElementValid(this.el) && this.isHtmlValid(html)) {
					this.el.innerHTML = html;
				} else {
					if (!this.isElementValid(this.el)) throw new TypeError('A valid DOM node has not been provided');
					if (!this.isHtmlValid(html)) throw new TypeError('Invalid html has been used to build the feed');
				}
			}

		}
		catch (e) {
			if (!(e instanceof Error)) {
				e = new Error(e);
			}
			console.error(e.message);
		}

	}

	// await fetch, try/catch server/xml errors
	async fetchFeedJson(report = true) {

		let json;

		try {

			const response = await fetch(this.#proxy_url);
			json = await response.json();

			if (report) {
				if (!response.ok) throw new Error('A valid response was not returned from fetch. bad url given. ' + response.statusText);
				if (!json || json.length == 0 || json.error == true) throw new Error('No json was returned. bad url given.');
			}

		}
		catch (err) {

			if (report) {
				if (err instanceof SyntaxError) console.log('There was a SyntaxError (Unexpected token < in JSON).', err);
				else if (err instanceof TypeError) console.log('There was an issue connecting to the necessary server.', err);
				else console.log('The response was not ok.', err)
			}

		}

		if (json) return json; // promise returned
	}

	// await render, try/catch rendering errors (json input & html out)
	async renderFeedJsonAsHtml(json, report = true) {

		let html;

		try {
			const context = this.createContextFromJson(json);
			html = await this.#twing.render('jobs.twig', context);
			if (report) {
				if (!json || json.length == 0 || json.error == true) throw new Error('The json provided was invalid or empty.');
				if (!html || html.length == 0 || !this.isHtmlValid(html)) throw new Error('There was an error rendering the feed.');
			}
		}
		catch (err) {
			if (report) {
				console.log(err);
			}
		}

		if (html && this.isHtmlValid(html)) return html; // promise returned

	}

}
window.MidlandJobsFeed = MidlandJobsFeed;

