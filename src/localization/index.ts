import enMessages from './en.json';

type LocalizedStringTable = Record<string, unknown> & {
    language?: string;
};

type LocaleLoader = () => Promise<{ default: LocalizedStringTable }>;

const languageNames: Record<string, string> = {
    cs: 'Čeština (cs)',
    de: 'Deutsch (de)',
    en: 'English (en)',
    es: 'Español (es)',
    fr: 'Français (fr)',
    ja: '日本語 (ja)',
    ko: '한국어 (ko)',
    pt: 'Português Brasileiro (pt-br)',
    ru: 'Русский (ru)',
    'zh-CN': '中文（简体） (zh-CN)',
    'zh-TW': '中文（繁體） (zh-TW)'
};

const localeLoaders: Record<string, LocaleLoader> = {
    cs: () => import('./cs.json'),
    de: () => import('./de.json'),
    es: () => import('./es.json'),
    fr: () => import('./fr.json'),
    ja: () => import('./ja.json'),
    ko: () => import('./ko.json'),
    pt: () => import('./pt.json'),
    ru: () => import('./ru.json'),
    'zh-CN': () => import('./zh-CN.json'),
    'zh-TW': () => import('./zh-TW.json')
};

const loadedLocales = new Map<string, LocalizedStringTable>([
    ['en', enMessages]
]);
const pendingLocales = new Map<string, Promise<LocalizedStringTable>>();

export const FALLBACK_LOCALE_CODE = 'en';
export const fallbackLocaleMessages: LocalizedStringTable = enMessages;

export function loadLocaleMessages(
    code: string
): Promise<LocalizedStringTable> {
    const loaded = loadedLocales.get(code);
    if (loaded) {
        return Promise.resolve(loaded);
    }

    const pending = pendingLocales.get(code);
    if (pending) {
        return pending;
    }

    const loader = localeLoaders[code];
    if (!loader) {
        return Promise.resolve(enMessages);
    }

    const request = loader()
        .then((module) => {
            const messages = module.default;
            loadedLocales.set(code, messages);
            pendingLocales.delete(code);
            return messages;
        })
        .catch((error: unknown) => {
            pendingLocales.delete(code);
            throw error;
        });
    pendingLocales.set(code, request);
    return request;
}

function getLanguageName(code: string) {
    return (languageNames[code] ?? code).replace(/\s+\([^)]+\)$/, '');
}

export * from './locales';
export { getLanguageName };
