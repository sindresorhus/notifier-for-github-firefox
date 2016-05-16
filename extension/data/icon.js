'use strict';

self.port.on('render', function (data) {
	let countElem;
	let repoElem;
	let issue;
	let tmp = document.createElement('div');

	tmp.innerHTML = unescape(data);
	countElem = tmp.querySelector('a[href="/notifications"] .count');
	repoElem = tmp.querySelector('.notifications-list > .js-notifications-browser');

	if(repoElem!=null){
		let item = repoElem.querySelector('li.list-group-item');
		let target = item.querySelector('a.js-notification-target');
		issue = {
			repo: repoElem.querySelector('.notifications-repo-link').textContent,
			participants: item.querySelector('.notification-actions > .tooltipped').getAttribute('aria-label'),
			title: target.getAttribute('title'),
			url: target.getAttribute('href'),
			firstAvatar: item.querySelector('img.avatar').getAttribute('src')
		};
	}

	self.port.emit('fetched', countElem && countElem.textContent, issue && JSON.stringify(issue));
});
