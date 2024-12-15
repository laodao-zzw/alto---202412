module.exports = function concat(...args) {
	args.pop(); // Handlebars options object, which we don't care about
	return args.join("");
};
