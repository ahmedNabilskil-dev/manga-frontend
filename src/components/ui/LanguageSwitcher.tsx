import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation("common");
  const router = useRouter();

  const changeLanguage = (lng: string) => {
    router.push(router.pathname, router.asPath, { locale: lng });
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
