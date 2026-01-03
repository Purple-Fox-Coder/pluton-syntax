const Path = require("path");
const Fs   = require("fs");

/// The name of this package
const PACKAGE_NAME = require("../package.json").name ?? "pluton-syntax";

/// A custom configuration for this package, putting it in the styles/ folder
const OVERRIDES_PATH = Path.resolve(
  Path.join(__dirname, '..', 'styles', 'overrides.less')
);

const COLOURS_PATH = Path.resolve(
  Path.join(__dirname, '..', 'styles', 'colors.less')
);

const DARK_COLOURS = "@import \"themes/dark-theme\";"
const LIGHT_COLOURS = "@import \"themes/light-theme\";"

const UI_OVERRIDES_SYNTAX_DARK  = "@import \"overrides/dark-syntax\";";
const UI_OVERRIDES_SYNTAX_LIGHT = "@import \"overrides/light-syntax\";";

function openConfig() {
  atom.workspace.open(`atom://config/packages/${PACKAGE_NAME}`);
}

function reloadTheme() {
  const current_themes = atom.config.get("core.themes");
  // hacky but I guess it works, should probably ask if there's a better way to handle this
  atom.config.set("core.themes", [current_themes[0], "one-dark-syntax"]);
  atom.config.set("core.themes", current_themes);
}

/// Creates the config.less file
async function updateOverrides() {
  const ui_overrides_enabled = atom.config.get(
    `${PACKAGE_NAME}.ui_overrides_enabled`
  );
  const light_mode_enabled = atom.config.get(
    `${PACKAGE_NAME}.light_mode_enabled`
  );

  try {
    // if UI overrides are on, use the appropriate override by which syntax variant
    // is enabled.  Otherwise empty the file
    await Fs.promises.writeFile(
      OVERRIDES_PATH ,
      ui_overrides_enabled ? (
        light_mode_enabled ? UI_OVERRIDES_SYNTAX_LIGHT : UI_OVERRIDES_SYNTAX_DARK
      ) : "" ,
      { flag: 'w' }
    );
  } catch (err) {
    console.error("Could not write overrides; got: ", err);
  }

  reloadTheme();
}

async function updateLightMode() {
  const light_mode_enabled = atom.config.get(
    `${PACKAGE_NAME}.light_mode_enabled`
  );

  try {
    await Fs.promises.writeFile(
      COLOURS_PATH,
      light_mode_enabled ? LIGHT_COLOURS : DARK_COLOURS,
      { flag: 'w' }
    );
  } catch (err) {
    console.error("Could not write new colours; got: ", err);
  }

  reloadTheme();
}

/// Returns only TRUE or FALSE
function doesConfigExist() {
  return Fs.existsSync(OVERRIDES_PATH) && Fs.existsSync(COLOURS_PATH);
}

module.exports.config = {
    light_mode_enabled: {
      type: "boolean",
      title: "Enable Light Mode",
      description: "Enable this package's Light mode version, use CTRL+SHIFT+F5 to reload pulsar after applying",
      default: false,
      order: 1
    },
    ui_overrides_enabled: {
      type: "boolean",
      title: "Enable UI Overrides",
      description: "Enable this package's UI Overrides for use with Dark mode UI -> light mode or Light mode UI -> dark mode, use CTRL+SHIFT+F5 to reload pulsar after applying",
      default: false,
      order: 2
    }
}

atom.config.onDidChange(`${PACKAGE_NAME}.light_mode_enabled`, updateLightMode);
atom.config.onDidChange(`${PACKAGE_NAME}.ui_overrides_enabled`, updateOverrides);
