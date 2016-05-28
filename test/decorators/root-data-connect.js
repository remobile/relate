import expect from 'expect';
import React from 'react';

import {rootDataConnect} from '../../lib';

describe('Root data connect', () => {
  const Container = () => (<div></div>);
  const ConnectedComponent = rootDataConnect()(Container);
  const initConnected = new ConnectedComponent();

  it('Constructor', () => {
    expect(initConnected.bundle).toEqual({});
    expect(initConnected.childFetchDataBind).toBeA(Function);
    expect(initConnected.fetchDebounce).toBeA(Function);
    expect(initConnected.scopeID).toEqual(0);
  });

  it('Gets child context', () => {
    expect(initConnected.getChildContext()).toEqual({
      fetchData: initConnected.childFetchDataBind
    });
  });

  describe('Bundles children fetch data requests', () => {
    it('Adds fragments with no variables', () => {
      initConnected.childFetchData({
        fragments: {
          pages: {
            _id: 1,
            title: 1
          }
        },
        ID: 'conn1'
      });
      expect(initConnected.bundle).toEqual({
        fragments: {
          pages: {
            _id: 1,
            title: 1
          }
        },
        variables: {},
        connectors: {
          conn1: {
            fragments: {
              pages: {
                _id: 1,
                title: 1
              }
            },
            mutations: undefined,
            loadMore: false,
            scopes: {}
          }
        }
      });
    });

    it('Adds non colliding fragment with variables', () => {
      initConnected.childFetchData({
        fragments: {
          page: {
            _id: 1,
            title: 1
          }
        },
        variables: {
          page: {
            id: {
              type: 'ID!',
              value: 'pagex'
            }
          }
        },
        ID: 'conn2'
      });
      expect(initConnected.bundle).toEqual({
        fragments: {
          pages: {
            _id: 1,
            title: 1
          },
          page: {
            _id: 1,
            title: 1
          }
        },
        variables: {
          page: {
            id: {
              type: 'ID!',
              value: 'pagex'
            }
          }
        },
        connectors: {
          conn1: {
            fragments: {
              pages: {
                _id: 1,
                title: 1
              }
            },
            mutations: undefined,
            loadMore: false,
            scopes: {}
          },
          conn2: {
            fragments: {
              page: {
                _id: 1,
                title: 1
              }
            },
            mutations: undefined,
            loadMore: false,
            scopes: {}
          }
        }
      });
    });

    it('Adds multiple non colliding fragments', () => {
      initConnected.childFetchData({
        fragments: {
          menus: {
            _id: 1,
            date: 1
          },
          menu: {
            _id: 1,
            date: 1,
            title: 1
          }
        },
        variables: {
          menu: {
            id: {
              type: 'ID!',
              value: 'menux'
            }
          }
        },
        ID: 'conn3'
      });
      expect(initConnected.bundle).toEqual({
        fragments: {
          pages: {
            _id: 1,
            title: 1
          },
          page: {
            _id: 1,
            title: 1
          },
          menus: {
            _id: 1,
            date: 1
          },
          menu: {
            _id: 1,
            date: 1,
            title: 1
          }
        },
        variables: {
          page: {
            id: {
              type: 'ID!',
              value: 'pagex'
            }
          },
          menu: {
            id: {
              type: 'ID!',
              value: 'menux'
            }
          }
        },
        connectors: {
          conn1: {
            fragments: {
              pages: {
                _id: 1,
                title: 1
              }
            },
            mutations: undefined,
            loadMore: false,
            scopes: {}
          },
          conn2: {
            fragments: {
              page: {
                _id: 1,
                title: 1
              }
            },
            mutations: undefined,
            loadMore: false,
            scopes: {}
          },
          conn3: {
            fragments: {
              menus: {
                _id: 1,
                date: 1
              },
              menu: {
                _id: 1,
                date: 1,
                title: 1
              }
            },
            mutations: undefined,
            loadMore: false,
            scopes: {}
          }
        }
      });
    });

    it('Adds colliding fragments with no variables', () => {
      initConnected.bundle = {}; // cleanup
      initConnected.childFetchData({
        fragments: {
          pages: {
            _id: 1,
            title: 1
          },
          menus: {
            _id: 1,
            date: 1
          }
        },
        variables: {},
        ID: 'conn1'
      });
      initConnected.childFetchData({
        fragments: {
          pages: {
            _id: 1,
            date: 1,
            published: 1
          },
          menus: {
            _id: 1,
            title: 1,
            data: 1
          }
        },
        variables: {},
        ID: 'conn2'
      });
      expect(initConnected.bundle).toEqual({
        fragments: {
          pages: {
            _id: 1,
            title: 1,
            date: 1,
            published: 1
          },
          menus: {
            _id: 1,
            title: 1,
            data: 1,
            date: 1
          }
        },
        variables: {},
        connectors: {
          conn1: {
            fragments: {
              pages: {
                _id: 1,
                title: 1
              },
              menus: {
                _id: 1,
                date: 1
              }
            },
            mutations: undefined,
            loadMore: false,
            scopes: {}
          },
          conn2: {
            fragments: {
              pages: {
                _id: 1,
                date: 1,
                published: 1
              },
              menus: {
                _id: 1,
                title: 1,
                data: 1
              }
            },
            mutations: undefined,
            loadMore: false,
            scopes: {}
          }
        }
      });
    });

    it('Adds colliding fragments with same variables', () => {
      initConnected.bundle = {}; // cleanup
      initConnected.childFetchData({
        fragments: {
          page: {
            _id: 1,
            title: 1
          },
          menu: {
            _id: 1,
            date: 1
          }
        },
        variables: {
          page: {
            id: {
              type: 'ID!',
              value: 'pagex'
            }
          },
          menu: {
            id: {
              type: 'ID!',
              value: 'menux'
            }
          }
        },
        ID: 'conn1'
      });
      initConnected.childFetchData({
        fragments: {
          page: {
            _id: 1,
            date: 1,
            published: 1
          },
          menu: {
            _id: 1,
            title: 1,
            data: 1
          }
        },
        variables: {
          page: {
            id: {
              type: 'ID!',
              value: 'pagex'
            }
          },
          menu: {
            id: {
              type: 'ID!',
              value: 'menux'
            }
          }
        },
        ID: 'conn2'
      });
      expect(initConnected.bundle).toEqual({
        fragments: {
          page: {
            _id: 1,
            title: 1,
            date: 1,
            published: 1
          },
          menu: {
            _id: 1,
            title: 1,
            data: 1,
            date: 1
          }
        },
        variables: {
          page: {
            id: {
              type: 'ID!',
              value: 'pagex'
            }
          },
          menu: {
            id: {
              type: 'ID!',
              value: 'menux'
            }
          }
        },
        connectors: {
          conn1: {
            fragments: {
              page: {
                _id: 1,
                title: 1
              },
              menu: {
                _id: 1,
                date: 1
              }
            },
            mutations: undefined,
            loadMore: false,
            scopes: {}
          },
          conn2: {
            fragments: {
              page: {
                _id: 1,
                date: 1,
                published: 1
              },
              menu: {
                _id: 1,
                title: 1,
                data: 1
              }
            },
            mutations: undefined,
            loadMore: false,
            scopes: {}
          }
        }
      });
    });

    it('Scopes colliding fragments with different variables', () => {
      initConnected.bundle = {}; // cleanup
      initConnected.childFetchData({
        fragments: {
          page: {
            _id: 1,
            title: 1
          },
          menu: {
            _id: 1,
            date: 1
          }
        },
        variables: {
          page: {
            id: {
              type: 'ID!',
              value: 'pagex'
            }
          },
          menu: {
            id: {
              type: 'ID!',
              value: 'menux'
            }
          }
        },
        ID: 'conn1'
      });
      initConnected.childFetchData({
        fragments: {
          page: {
            _id: 1,
            date: 1,
            published: 1
          },
          menu: {
            _id: 1,
            title: 1,
            data: 1
          }
        },
        variables: {
          page: {
            id: {
              type: 'ID!',
              value: 'pagey'
            }
          },
          menu: {
            id: {
              type: 'ID!',
              value: 'menuy'
            }
          }
        },
        ID: 'conn2'
      });
      initConnected.childFetchData({
        fragments: {
          page: {
            _id: 1,
            something: 1
          }
        },
        variables: {}, // with no variables
        ID: 'conn3'
      });
      expect(initConnected.bundle).toEqual({
        fragments: {
          page: {
            _id: 1,
            title: 1
          },
          'relate_0: page': {
            _id: 1,
            date: 1,
            published: 1
          },
          menu: {
            _id: 1,
            date: 1
          },
          'relate_1: menu': {
            _id: 1,
            title: 1,
            data: 1
          },
          'relate_2: page': {
            _id: 1,
            something: 1
          }
        },
        variables: {
          page: {
            id: {
              type: 'ID!',
              value: 'pagex'
            }
          },
          menu: {
            id: {
              type: 'ID!',
              value: 'menux'
            }
          },
          'relate_0: page': {
            id: {
              type: 'ID!',
              value: 'pagey'
            }
          },
          'relate_1: menu': {
            id: {
              type: 'ID!',
              value: 'menuy'
            }
          }
        },
        connectors: {
          conn1: {
            fragments: {
              page: {
                _id: 1,
                title: 1
              },
              menu: {
                _id: 1,
                date: 1
              }
            },
            mutations: undefined,
            loadMore: false,
            scopes: {}
          },
          conn2: {
            fragments: {
              page: {
                _id: 1,
                date: 1,
                published: 1
              },
              menu: {
                _id: 1,
                title: 1,
                data: 1
              }
            },
            mutations: undefined,
            loadMore: false,
            scopes: {
              relate_0: 'page',
              relate_1: 'menu'
            }
          },
          conn3: {
            fragments: {
              page: {
                _id: 1,
                something: 1
              }
            },
            mutations: undefined,
            loadMore: false,
            scopes: {
              relate_2: 'page'
            }
          }
        }
      });
    });
  });
});
