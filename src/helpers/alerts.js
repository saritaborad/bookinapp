import swal from "sweetalert";
import {checkForArabic} from "./arabicLangValidator";

export const showIncorrectPropertyIdAllert = async (text, t, history) =>  {
	const value = await swal({
		text: t(text),
		icon: "warning",
		buttons: {
			confirm: { value: "home", text: t("common:home") },
			contact: { value: "contact", text: t("common:contact") },
		},
		className: checkForArabic("arabic-properties-modal")
	});

	history.push("/search?city=dubai");

	if (value === "contact") {
		window.dispatchEvent(new Event("openContact"));
	}
};
