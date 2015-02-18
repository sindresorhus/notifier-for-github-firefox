'use strict';
const tabs = require('sdk/tabs');
const data = require('sdk/self').data;
const Request = require('sdk/request').Request;
const pageWorker = require('sdk/page-worker');
const timers = require('sdk/timers');
const { ActionButton } = require('sdk/ui/button/action');

const notifUrl = 'https://github.com/notifications';
const updateInterval = 1000 * 60;

function update() {
	Request({
		url: notifUrl,
		onComplete: function (response) {
			worker.port.emit('render', response.text);
		}
		// Need to add a check if the computer is connected to the internet.
		// Waiting on a `onError` method.
	}).get();
};

let worker = pageWorker.Page({
	contentScriptFile: data.url('icon.js')
});

let tbb = ActionButton({
	id: 'github-notifier',
	label: 'GitHub Notifier',
	icon: {
		'16': './icon-16.png',
		'32': './icon-32.png',
		'64': './icon-64.png',
	},
	onClick: function (state) {
		let found = false;
		for (let otherTab of tabs) {
			if (found = otherTab.url === notifUrl) {
				otherTab.activate();
				otherTab.reload();
				break;
			}
		}
		found || tabs.open(notifUrl);

		timers.setTimeout(update, 1000 * 20);
		update();
	}
});

worker.port.on('fetched-count', function (count) {
	count = count > 999 ? '∞' : count;

	if (count) {
		tbb.label = 'GitHub Notifier';

		if (count !== '0') {
			tbb.badge = count;
			tbb.badgeColor = 'rgb(65, 131, 196)';
		} else {
			tbb.badge = null;
		}
	} else {
		tbb.label = 'You have to be logged into GitHub';
		tbb.badge = '?';
		tbb.badgeColor = 'rgb(166, 41, 41)';
	}
});

timers.setInterval(update, updateInterval);
update();
