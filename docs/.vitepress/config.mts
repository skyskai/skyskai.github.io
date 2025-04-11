import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default {
  head: [
    [
      'script',
      { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-WBW9VE8FYW' }
    ],
    [
      'script',
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-WBW9VE8FYW');`
    ]
  ],

  lastUpdated: true,
  title: 'ABAP ADT API Documentation',
  description: 'Developer Guide for ABAP ADT API',
  themeConfig: {
    siteTitle: 'ABAP ADT API',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started' },
      { text: 'API Documentation', link: '/api/' },
      { text: 'Examples', link: '/examples/' },
    ],
    sidebar: {
      '/api/': [
        {
          text: 'API Documentation',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'Core Features', link: '/api/core' },
            { text: 'Object Management', link: '/api/object-management' },
            { text: 'Development Features', link: '/api/development' },
            { text: 'Transport', link: '/api/transport' },
            { text: 'ABAP Git', link: '/api/git' },
            { text: 'Debugging', link: '/api/debugging' },
            { text: 'Testing', link: '/api/testing' },
            { text: 'Advanced Features', link: '/api/advanced' },
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'Basic Examples', link: '/examples/basic' },
            { text: 'Advanced Examples', link: '/examples/advanced' },
          ]
        }
      ]
    },
    search: {
      provider: 'local',
      options: {
        locales: {
          root: { // Make this `root` to translate the default locale.
            translations: {
              button: {
                buttonText: 'Search',
                buttonAriaLabel: 'Search'
              },
              modal: {
                displayDetails: 'Display detailed list',
                resetButtonTitle: 'Clear search',
                backButtonTitle: 'Close search',
                noResultsText: 'No results found',
                footer: {
                  selectText: 'Select',
                  selectKeyAriaLabel: 'Select',
                  navigateText: 'Navigate',
                  navigateUpKeyAriaLabel: 'Up',
                  navigateDownKeyAriaLabel: 'Down',
                  closeText: 'Close',
                  closeKeyAriaLabel: 'esc'
                }
              }
            }
          }
        }
      }
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/skyskai/skyskai.github.io' }
    ],
    footer: {
      message: 'ABAP ADT API Documentation',
      copyright: 'Written for the developer community.'
    }
  },
  locales: {
    root: {
      label: 'Enlish',
      lang: 'en'
    },
    ko: {
      label: '한국어',
      lang: 'ko', // 선택 사항, `html` 태그에 `lang` 어트리뷰트로 추가됩니다
      link: '/ko/',
      title: 'ABAP ADT API 문서',
      description: 'ABAP ADT API를 위한 개발자 가이드',
      themeConfig: {
        siteTitle: 'ABAP ADT API',
        nav: [
          { text: '홈', link: '/' },
          { text: '시작하기', link: '/getting-started' },
          { text: 'API 문서', link: '/api/' },
          { text: '예제', link: '/examples/' },
        ],
        sidebar: {
          '/api/': [
            {
              text: 'API 문서',
              items: [
                { text: '개요', link: '/api/' },
                { text: '기본 기능', link: '/api/core' },
                { text: '객체 관리', link: '/api/object-management' },
                { text: '개발 기능', link: '/api/development' },
                { text: '트랜스포트', link: '/api/transport' },
                { text: 'ABAP Git', link: '/api/git' },
                { text: '디버깅', link: '/api/debugging' },
                { text: '테스트', link: '/api/testing' },
                { text: '고급 기능', link: '/api/advanced' },
              ]
            }
          ],
          '/examples/': [
            {
              text: '예제',
              items: [
                { text: '개요', link: '/examples/' },
                { text: '기본 예제', link: '/examples/basic' },
                { text: '고급 예제', link: '/examples/advanced' },
              ]
            }
          ]
        },
        search: {
          provider: 'local',
          options: {
            locales: {
              root: { // 기본 로케일을 번역하려면 이것을 `root`로 만드십시오.
                translations: {
                  button: {
                    buttonText: '검색',
                    buttonAriaLabel: '검색'
                  },
                  modal: {
                    displayDetails: '상세 목록 표시',
                    resetButtonTitle: '검색 지우기',
                    backButtonTitle: '검색 닫기',
                    noResultsText: '결과를 찾을 수 없습니다',
                    footer: {
                      selectText: '선택',
                      selectKeyAriaLabel: '선택하기',
                      navigateText: '탐색',
                      navigateUpKeyAriaLabel: '위로',
                      navigateDownKeyAriaLabel: '아래로',
                      closeText: '닫기',
                      closeKeyAriaLabel: 'esc'
                    }
                  }
                }
              }
            }
          }
        },
        socialLinks: [
          { icon: 'github', link: 'https://github.com/skyskai/skyskai.github.io' }
        ],
        footer: {
          message: 'ABAP ADT API 문서',
          copyright: '개발자 커뮤니티를 위해 작성되었습니다.'
        }
      }
    }
  }
}
