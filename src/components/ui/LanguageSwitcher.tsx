import { useTranslation } from "next-i18next";

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation("common");

  const changeLanguage = (lng: string) => {
    console.log(lng);
  };

  return (
    <div>
      <span>{t("language")}: </span>
      <button onClick={() => changeLanguage("en")}>
        {t("switchToEnglish")}
      </button>
      <button onClick={() => changeLanguage("ar")}>
        {t("switchToArabic")}
      </button>
    </div>
  );
}
