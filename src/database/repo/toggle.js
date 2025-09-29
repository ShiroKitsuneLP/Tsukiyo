// Import necessary modules
const path = require('path');

// Import database connection
const { db } = require(path.join(__dirname, '../db'));

// Prepare statements
const setToggleStmt = db.prepare(`
	INSERT INTO toggles (channel, feature, enabled)
	VALUES (@channel, @feature, @enabled)
	ON CONFLICT(channel, feature) DO UPDATE SET enabled=excluded.enabled
`);

const getToggleStmt = db.prepare('SELECT enabled FROM toggles WHERE channel = @channel AND feature = @feature');

const deleteToggleStmt = db.prepare('DELETE FROM toggles WHERE channel = @channel AND feature = @feature');

const deleteAllTogglesStmt = db.prepare('DELETE FROM toggles WHERE channel = @channel');

// Set or update toggle
function setToggle(channel, feature, enabled) {
	setToggleStmt.run({ channel, feature, enabled });
}

// Get toggle (returns enabled or undefined)
function getToggle(channel, feature) {
	const row = getToggleStmt.get({ channel, feature });
	return row ? row.enabled : undefined;
}

// Delete toggle
function deleteToggle(channel, feature) {
	deleteToggleStmt.run({ channel, feature });
}

function deleteAllToggles(channel) {
	deleteAllTogglesStmt.run({ channel });
}

module.exports = {
	setToggle,
	getToggle,
	deleteToggle,
	deleteAllToggles
}