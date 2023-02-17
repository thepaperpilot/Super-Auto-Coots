# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.2] - 2022-08-22
### Added
- onLoad event
- fontsLoaded event
- Dismissable notification you can add to VueFeatures when they're interactable
- Option on exponential modifiers to better support numbers less than 1
- Utility function to track if a VueFeature is being hovered over
- Utility to unwrap Resources that may be in refs
- Utility to join JSX elements together with a joiner
- Type for converting readonly string arrays into a union of string values
### Changed
- The main and prestige layers no longer use arrow functions for their options functions
- Modifiers are now lazily loaded
- Collapsible modifier sections are now lazily loaded
- Converted several refs into shallow refs for improved performance
- Roboto Mono and Material Icons fonts are now bundled instead of downloaded from the web, so they work with PWAs
- Node bounds are now updated whenever that context has a node removed or added, fixing many issues with incorrect bounds
### Fixed
- trackResetTime not updating
- colorText prepending $s
- Default .replit config was broken
- Pixi.js canvases no longer rendering
- Node positions being shifted on initial page load due to fonts loading on firefox
- Modifier sections looked wrong if the topmost section wasn't visible

## [0.5.1] - 2022-07-17
### Added
- Notif component that displays a jumping exclamation point
- showAmount boolean to buyable displays
- Tab families now take option to style the tab buttons container
- Utility for creating text of a certain color
### Changed
- Improved typing of player.layers
- Improved typing of createCollapsibleModifierSections's parameters
- Made Particles vue component typed as GenericComponent due to issues generating documentation
- Minimized how much of pixi.js is included in the built site
- Split bundles into smaller bundles for faster loading
- Updated TypeScript
- Descriptions on buyables are now optional
- Improved tooltips performance
- Improved how MainDisplay displays effect strings
- MainDisplays are now sticky
- processComputable now binds uncached functions as well
### Fixed
- trackResetTime stopped working once its layer was removed and re-added
- Runtime compilation was disabled in vite config
- Websites had to be hosted on root directory to have assets load correctly
- Tooltips' persistent ref was lazily created
- In some situations Links would not update its bounding rect
- Achievements' and milestones' onComplete callbacks were firing on load
- Processed JSXFunctions were not considered coercable components by isCoercableComponent
- Error from passing in overlay text to bar component
### Removed
- lodash.cloneDeep dependency, which hasn't been used in awhile
- Some unused configs from vue-cli-service
### Documented
- Update vitepress, and updated the content of many pages
- Rest of /game
- Rest of /data
- layers.tsx
- Any type augmentations to Window object
- Various cleanup of docs comments
- Fixed doc generation being broken from switch to vite
### Tests
- Switched from jest to vitest

## [0.5.0] - 2022-06-27
### Added
- Projects now cache for offline play, and show notification when an update is available
- Projects can now be "installed" as a Progressive Web App
- Conversions can now be given a custom spend function, which defaults to setting the base resource amount to 0
- Components for displaying Floor and Square Root symbols
### Changed
- **BREAKING** Several projInfo properties now default to empty strings, to prevent things like reusing project IDs
- **BREAKING** Replaced vue-cli-service with vite (should not break most projects)
- Updated dependencies
- Made all type-only imports explicit
- setupPassiveGeneration now works properly on independent conversions
- setupPassiveGeneration now takes an option cap it can't go over
- Improved typing for PlayerData.layers
- Options Functions have an improved `this` type - it now includes the options themselves
- Removed v-show being used in data/common.tsx
### Tests
- Implement Jest, and running tests automatically on push
- Tests written for utils/common.ts

## [0.4.2] - 2022-05-23
### Added
- costModifier to conversions
- onConvert(amountGained) to conversions
### Changed
- **BREAKING** getFirstFeature has a new signature, that will lead to improved performance
- trackResetTime is now intended to be used with a reset button
- regularFormat handles small numbers better
- Slider tooltips now appear below the slider, not above
- Node's mutation observers now ignore attributes. This shouldn't have issues with links/particle effect positions, but prevents a _lot_ of unnecessary node updates
- OptionsFunc no longer takes its S type parameter, as it was unnecessary. Layer options functions now have proper `this` typing
    - Several functions have been updated to take BaseLayer instead of GenericLayer, to allow them to work with `this` inside layer options functions
### Fixed
- Particle effects and links would not always appear on reload or when switching layers
- Particle effects and links no longer appear in wrong spot after nodes are added or removed
- Collapsibles having wrong widths on the button and collapsed content sections
- Additive modifiers with negative values appeared like "+-" instead of "-"
- Buyables' onPurchase was not being called
- Reset button would display "Next:" if the buyMax property is a ref

## [0.4.1] - 2022-05-10
### Added
- findFeatures can now accept multiple feature types
- excludeFeatures can now be used to find features with a feature type _blacklist_
- All the icons in the saves manager now have tooltips
### Changed
- All touch events that can be passive now are
- Layers' style and classes attributes are now applied to the tab element rather than the layer-tab
- Saving now always uses lz-string, and saveEncoding has been renamed to exportEncoding
    - The property will now only affect exports, and defaults to base64 so exports can be shared in more places without issues
- Buyables can now have their onClick/purchase function overwritten
### Fixed
- Arrays in player were not being wrapped in proxies for things like NaN detection
- Error when switching between saves with different layers
- Links would sometimes error from trying to use nodes that were removed earlier that frame
- createModifierSection would require modifiers to have revert and enabled properties despite not using them
- Tab buttons would not use the style property if it was a ref
- Typings on the Board vue component were incorrect
- Offline time would always show, if offlineLimit is set to 0
- Buyables will now call onPurchase() when cost and/or resource were not set
- Presets dropdown wouldn't deselect the option after creating the save
### Documented
- feature.ts

## [0.4.0] - 2022-05-01
### Added
- Saves can now be encoded in two new options: plaintext and lz compressed, determined by a new "saveEncoding" property in projInfo
    - Saves will be loaded in whatever format is detected. The setting only applies when writing saves
- createModifierSection has new parameter to override the label used for the base value
- createCollapsibleModifierSections utility function to display `createModifierSection`s in collapsible forms
### Fixed
- Saves manager would not clear the current save from its cache when switching saves, leading to progress loss if flipping between saves
- Layer.minWidth being ignored
- Separators between tabs (player.tabs) would not extend to the bottom of the screen when scrolling
- Tree nodes not being clicked on their edges
### Changed
- **BREAKING** No features extend persistent anymore
    - This will break ALL existing saves that aren't manually dealt with in fixOldSave
    - Affected features: Achievement, Buyable, Grid, Infobox, Milestone, TabFamily, and Upgrade
    - Affected features will now have a property within them where the persistent ref is stored. This means new persistent refs can now be safely added to these features
- Features with option functions with 0 required properties now don't require passing in an options function
- Improved the look of the goBack and minimize buttons (and made them more consistent with each other)
- Newly created saves are immediately switched to
- TooltipDirection and Direction have been merged into one enum
- Made layers shallow reactive, so it works better with dynamic layers
- Modifier functions all have more explicit types now
- Scaling functions take computables instead of processed computables
### Removed
- Unused tsParticles.d.ts file
### Documented
- modifiers.ts
- conversions.ts

## [0.3.3] - 2022-04-24
### Fixed
- Spacing between rows in Tree components
- Computed style attributes on tooltips were ignored
- Tooltips could cause infinite loops due to cyclical dependencies

## [0.3.2] - 2022-04-23
### Fixed
- Clickables and several other elements would not register clicks sometimes, if the display is updating rapidly
- createLayerTreeNode wasn't using display option correctly

## [0.3.1] - 2022-04-23
### Added
- Render utility methods that always return JSX Elements
### Changed
- **BREAKING** Tooltips overhaul
    - Tree Nodes no longer have tooltips related properties
    - Tooltips can now be added to any feature with a Vue component using the `addTooltip` function
    - Any tooltip can be made pinnable by setting pinnable to true in the addTooltip options, or by passing a `Ref<boolean>` to a Tooltip component
    - Pinned tooltips have an icon to represent that. It can be disabled by setting the theme's `showPin` property to false
- Modifiers are now their own features rather than a part of conversions
    - Including utilities to display the current state of all the modifiers
- TabFamilies' options function is now optional
- Layer.minWidth can take string values
    - If parseable into a number, it'll have "px" appended. Otherwise it'll be un-processed
- TreeNodes now have Vue components attached to them
- `createResourceTooltip` now shows the resource name
- Made classic and aqua theme's `feature-foreground` color dark rather than light

## [0.3.0] - 2022-04-10
### Added
- conversion.currentAt [#4](https://github.com/profectus-engine/Profectus/pull/4)
- OptionsFunc utility type, improving type inferencing in feature types
- minimumGain property to ResetButton, defaulting to 1
### Changed
- **BREAKING** Major persistence rework
    - Removed makePersistent
    - Removed old Persistent, and renamed PersistentRef to Persistent
    - createLazyProxy now takes optional base object (replacing use cases for makePersistent)
    - Added warnings when creating refs outside a layer
    - Added warnings when persistent refs aren't included in their layer object
- **BREAKING** createLayer now takes id as the first param, rather than inside the option function
- resetButton now shows "Req:" instead of "Next:" when conversion.buyMax is false
- Conversion nextAt and currentAt now cap at 0 after reverting modifier
### Fixed
- Independent conversion gain calculation [#4](https://github.com/profectus-engine/Profectus/pull/4)
- Persistence issue when loading layer dynamically
- resetButton's gain and requirement display being incorrect when conversion.buyMax is false
- Independent conversions with buyMax false capping incorrectly

## [0.2.2] - 2022-04-01
Unironically posting an update on April Fool's Day ;)
### Changed
- **BREAKING** Replaced tsparticles with pixi-emitter. Different options, and behaves differently.
- Print key and value in lazy proxy's setter message
- Update bounding boxes after web fonts load in
### Removed
- safff.txt

## [0.2.1] - 2022-03-29
### Changed
- **BREAKING** Reworked conversion.modifyGainAmount into conversion.gainModifier, with several utility functions. This makes nextAt accurate with modified gain
### Fixed
- Made overlay nav not overlap leftmost layer

## [0.2.0] - 2022-03-27
### Added
- Particles feature
- Collapsible layout component
- Utility function for splitting off the first from the list of features that meets a given filter
### Changed
- **BREAKING** Reworked most of the code from Links into a generic Context component that manages the positions of features in the DOM
- Updated vue-cli and TS dependencies
- Challenges cannot be started when maxed, and `canStart` now defaults to `true`
- onClick listeners on various features now get passed a MouseEvent or TouchEvent when possible
- Minor style changes to Milestones, most notably removing min-height
### Fixed
- Buyables didn't support CoercableComponents for displays
- TreeNodes would have a double glow effect on hover
### Removed
- Unused mousemove listener attached to App.vue

## [0.1.4] - 2022-03-13
### Added
- You can now access this.on() from within a createLayer function (and other BaseLayer properties)
- Support for passing non-persistent refs to createResource
- dontMerge class to allow features to ignore mergeAdjacent
### Fixed
- Clickables would not merge adjacent
- onClick and onHold functions would not be bound to their object when being called
- Refs passed to a components style prop would be ignored
- Fixed z-index issue when stopping hovering over features with .can class

## [0.1.3] - 2022-03-11
### Added
- Milestone.complete
- Challenge.complete
- setupAutoClick function to run a clickable's onClick every tick
- setupAutoComplete function to attempt to complete a challenge every tick
- isAnyChallengeActive function to query if any challenge from a given list is active
- Hotkeys now appear in info modal, if any exist
- projInfo.json now includes a "enablePausing" option that can be used to prevent the player from pausing the game
- Added a "gameWon" global event
### Changed
- **BREAKING** Buyables now default to an infinite purchase limit
- **BREAKING** devSpeed, playedTime, offlineTime, and diff now use numbers instead of Decimals
- **BREAKING** Achievements and milestones now use watchEffect to check for completion, instead of polling each tick. shouldEarn properties now only accept functions
- Cached more decimal values for optimization
### Fixed
- Many types not being exported
- setupHoldToClick wouldn't stop clicking after a component is unmounted
- Header's banner would not have correct width
### Removed
- **BREAKING** Removed setupAutoReset
### Documentation
- Support for documentation generation using typedoc
- Hide main layer from docs
- Hide prestige layer from docs
- Use stub declaration files for libs that don't provide types (vue-panzoom and vue-textarea-autosize)

## [0.1.2] - 2022-03-05
### Changed
- **BREAKING** Removed "@" path alias, and used baseUrl instead
- **BREAKING** Renamed createExponentialScaling to createPolynomialScaling and removed coefficient parameter
- Changed options passed into createLayerTreeNode; now allows overriding display
- App component is no longer cloned before being passed to `createApp`
- Changed TS version from ^4.5.4 to ~4.5.5
### Fixed
- Document title is set as soon as possible now

## [0.1.1] - 2022-03-02
### Added
- Configuration for Glitch projects
- Configuration for Replit projects
- Hide versionTitle if blank
### Changed
- **BREAKING** Renamed modInfo.json -> projInfo.json
- **BREAKING** Renamed mod.tsx -> projEntry.tsx
- Improved performance of branch drawing code
- Improved performance of formatting numbers
- Changed some projInfo default values to empty strings
- Renamed projInfo.allowSmall -> projInfo.defaultShowSmall
### Fixed
- Spacing on discord logo in NaN screen
- Some files accessing old location for persistence code
- Fixed lint-staged not being listed in devDependencies
- Branch locations were not accurate after scrolling
- Saves Manager displayed "default body" while closing
- Reset buttons activating when held down when canClick is false
- Lifting up on auto clickable elements not stopping the auto clicker
### Removed
- Removed Theme.stackedInfoboxes
- Removed Theme.showSingleTab

## [0.1.0] - Initial Release
