let loginModalOpen = $state(false);
let newPostOpen = $state(false);

export const ui = {
	get loginModalOpen() {
		return loginModalOpen;
	},
	set loginModalOpen(v) {
		loginModalOpen = v;
	},
	get newPostOpen() {
		return newPostOpen;
	},
	set newPostOpen(v) {
		newPostOpen = v;
	}
};
