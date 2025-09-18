# setup-love

[![version](https://badgen.net/github/release/remarkablegames/setup-love)](https://github.com/remarkablegames/setup-love/releases)
[![build](https://github.com/remarkablegames/setup-love/actions/workflows/build.yml/badge.svg)](https://github.com/remarkablegames/setup-love/actions/workflows/build.yml)
[![codecov](https://codecov.io/gh/remarkablegames/setup-love/graph/badge.svg?token=PGPJ2Q8HUO)](https://codecov.io/gh/remarkablegames/setup-love)

❤️ Set up your GitHub Actions workflow with [LÖVE](https://love2d.org/).

## Quick Start

```yaml
name: setup-love
on: push
jobs:
  setup-love:
    runs-on: ubuntu-latest
    steps:
      - name: Setup love
        uses: remarkablegames/setup-love@v1

      - name: Display version
        run: love --version
```

## Usage

Set up LÖVE CLI:

```yaml
- uses: remarkablegames/setup-love@v1
```

See [action.yml](action.yml)

## Inputs

### `version`

**Optional**: The LÖVE [version](https://github.com/love2d/love/releases). Defaults to [`11.5`](https://github.com/love2d/love/releases/tag/11.5):

```yaml
- uses: remarkablegames/setup-love@v1
  with:
    version: 11.5
```

## License

[MIT](LICENSE)
