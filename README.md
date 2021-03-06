# reveal-prepare-timing-plugin

This plugin helps you bootstrap timings on your [Reveal](https://github.com/hakimel/reveal.js) slides.

The speaker timer is really useful to see whether you are rushing or lagging. To make the most out of it, it's better to make sure your slides are timed correctly. 

This can be done by setting the HTML attribute `data-timing` on your slide.

This plugin allows you to start recording your presentation while you rehearse. At the end, it'll show you the time you spent on each slide so that you can be prepared and adjust if need be.

## How it works

The plugin can be started by typing `t` (keyboard shortcut overridable).

It records the time you spend on each slide and presents you a full report next time you type `t`.

You can optionally download the report as a JSON file.

The report can be viewed any time by typing `y` (overridable too).

> Note: when the plugin is recording, you'll see a red dot at the top-right of the screen.

> Note 2: the recording is erased when you start another one.

## Apply the timings

Copying all the timings by hand to the source document is a boring task that you can avoid doing.

This plugin comes with an executable that takes the path to your HTML presentation and the path to the report you downloaded and applies to the timings from the report to the presentation.

Call it as follows: 

```
npx rpt apply \
  --source-path /path/to/presentation/file.html \
  --report-path /path/to/report.json
```

## Installation

Install the npm package.

```shell script
npm install --save-dev --save-exact reveal-prepare-timing-plugin
```

Reference it from your presentation.

```js
Reveal.initialize({
  // Your config here
  dependencies: [
    // Your plugins here
    { 
      src: './node_modules/reveal-prepare-timing-plugin/dist/index.js', 
      async: true,
    },
  ],
});
```

## Roadmap

- [x] Write build script
- [x] Publish to npmjs
- [ ] Publish to Reveal doc
- [x] Write script to auto-apply downloaded report on presentation's source
- [ ] Stop recording when Reveal presentation is paused
- [ ] When Reveal exposes the theme variables, use them (see [the related PR](https://github.com/hakimel/reveal.js/pull/2521))
- [ ] Add screenshots to the README
