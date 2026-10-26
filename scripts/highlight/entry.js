// The highlight.js build that scripts/build-highlight.sh inlines into template.html.
// Core plus the languages feeds most often carry; add or remove one here and rebuild.
import hljs from "highlight.js/lib/core";

import bash from "highlight.js/lib/languages/bash";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import csharp from "highlight.js/lib/languages/csharp";
import css from "highlight.js/lib/languages/css";
import diff from "highlight.js/lib/languages/diff";
import go from "highlight.js/lib/languages/go";
import ini from "highlight.js/lib/languages/ini";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import kotlin from "highlight.js/lib/languages/kotlin";
import markdown from "highlight.js/lib/languages/markdown";
import objectivec from "highlight.js/lib/languages/objectivec";
import php from "highlight.js/lib/languages/php";
import python from "highlight.js/lib/languages/python";
import ruby from "highlight.js/lib/languages/ruby";
import rust from "highlight.js/lib/languages/rust";
import sql from "highlight.js/lib/languages/sql";
import swift from "highlight.js/lib/languages/swift";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";

var languages = { bash, c, cpp, csharp, css, diff, go, ini, java, javascript, json, kotlin, markdown, objectivec, php, python, ruby, rust, sql, swift, typescript, xml, yaml };
Object.keys(languages).forEach(function (name) { hljs.registerLanguage(name, languages[name]); });
hljs.registerAliases(["sh", "shell", "zsh", "console"], { languageName: "bash" });

window.daisyHighlighter = hljs;
