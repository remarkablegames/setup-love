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
      - name: Setup setup-love
        uses: remarkablegames/setup-love@v1
```

## Usage

**Basic:**

```yaml
- uses: remarkablegames/setup-love@v1
```

See [action.yml](action.yml)

## Inputs

### `cli-version`

**Optional**: The CLI [version](https://github.com/cli/cli/releases). Defaults to [`2.49.0`](https://github.com/cli/cli/releases/tag/v2.49.0):

```yaml
- uses: remarkablegames/setup-love@v1
  with:
    cli-version: 2.49.0
```

### `cli-name`

**Optional**: The CLI name. Defaults to `gh`:

```yaml
- uses: remarkablegames/setup-love@v1
  with:
    cli-name: gh
```

## License

[MIT](LICENSE)
