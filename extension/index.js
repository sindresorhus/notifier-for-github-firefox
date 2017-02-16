'use strict';
const tabs = require('sdk/tabs');
const data = require('sdk/self').data;
const Request = require('sdk/request').Request;
const pageWorker = require('sdk/page-worker');
const timers = require('sdk/timers');
const { ActionButton } = require('sdk/ui/button/action');
const notifications = require("sdk/notifications");

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
	id: 'notifier-for-github',
	label: 'Notifier for GitHub',
	icon: {
		'16': './icon-16.png',
		'32': './icon-32.png',
		'64': './icon-64.png',
	},
	onClick: function (state) {
		let found = false;
		const currentTab = tabs.activeTab;
		for (let tab of tabs) {
			if (found = (tab.url === notifUrl && tab.window === currentTab.window)) {
				tab.activate();
				tab.reload();
				break;
			}
		}
		if (!found) {
			if (currentTab.url === 'about:blank' || currentTab.url === 'about:newtab') {
				currentTab.url = notifUrl;
			} else {
				tabs.open(notifUrl);
			}
		}

		timers.setTimeout(update, 1000 * 20);
		update();
	}
});

worker.port.on('fetched', function (count, issue) {
	count = count > 999 ? '∞' : count;

	if (count && count!=tbb.badge) {
		tbb.label = 'Notifier for GitHub';

		if (count !== '0') {
			if(issue!=null && (tbb.badge=='?' || tbb.badge==null || count>tbb.badge)){
				issue = JSON.parse(issue);

				notifications.notify({
					title: "New notification on GitHub",
					text: "At "+issue.repo+": "+issue.participants+" in issue '"+issue.title+"'",
					iconURL: issue.firstAvatar,
					onClick: function () {
						tabs.open(issue.url);
					}
				});
			}

			tbb.badge = count;
			tbb.badgeColor = 'rgb(65, 131, 196)';
		} else {
			tbb.badge = null;
		}
	} else if(!count) {
		tbb.label = 'You have to be logged into GitHub';
		tbb.badge = '?';
		tbb.badgeColor = 'rgb(166, 41, 41)';
	}
});

timers.setInterval(update, updateInterval);
update();
