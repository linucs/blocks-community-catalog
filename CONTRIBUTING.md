# Contributing Block Catalogs

## How to contribute

1. **Fork** this repository
2. **Create** your catalog YAML file under `catalogs/<vendor>/<component>.yaml`
3. **Open a Pull Request** targeting `main`

## Catalog file format

Each YAML file must conform to the [block-catalog v1 schema](https://github.com/linucs/vscode-blockly/blob/main/src/catalog/block-catalog_v1.schema.json).

Minimal example:

```yaml
id: my-sensor
category: "Sensors"
description:
  en: "Blocks for the My Sensor library"
  it: "Blocchi per la libreria My Sensor"
implementations:
  - runtime: "arduino:cpp"
    dependencies:
      - type: library
        name: MySensorLib
    blocks:
      - blockly:
          type: my_sensor_read
          message0:
            en: "read sensor value"
            it: "leggi valore sensore"
          output: Number
        codegen:
          imports:
            - "#include <MySensorLib.h>"
          body:
            - "MySensor.read()"
          precedence: ATOMIC
```

## Guidelines

- **id**: use `kebab-case` (e.g., `modulino-thermo`, `bme280-sensor`)
- **category**: group by function (e.g., `Sensors`, `Actuators`, `Communication`, `Displays`)
- **description**: always provide at least an `en` key; add other locales as you can
- **vendor folder**: name it after the manufacturer or library author (e.g., `adafruit`, `sparkfun`, `modulino`)
- **Validate** your YAML against the schema before submitting (the Blocks Editor extension can do this via the `@blocks /validate` chat command)

## Testing locally

1. Copy your YAML file into a project's `.blocks/` folder
2. Open a source file with "Open With > Blocks Editor" in VS Code
3. Your blocks should appear in the toolbox

## Index generation

`index.json` is rebuilt automatically by CI on every push to `main`. You do not need to update it manually.
