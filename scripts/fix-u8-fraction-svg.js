// One-off layout fix for G2 u8 fraction worked-example SVGs.
//
// 11 fraction-circle SVGs in src/data/u8.js have viewBox="0 0 100 100" and
// an inline <text x="50" y="96" ...>LABEL</text> element. The circle ends at
// y=90, so the y=96 text baseline overlaps the bottom stroke.
//
// Fix: bump those SVGs' viewBox+height to 100x118 and move the text baseline
// to y=110 so the label sits cleanly below the circle. Four other 100x100
// SVGs in the file (no inline label) are left untouched.

const fs   = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'src', 'data', 'u8.js');
const src    = fs.readFileSync(target, 'utf8');

const svgRe = /<svg width=\\"100\\" height=\\"100\\" viewBox=\\"0 0 100 100\\"[\s\S]*?<\/svg>/g;

let replaced = 0;
let scanned  = 0;
const out = src.replace(svgRe, (m) => {
  scanned++;
  if (!m.includes('y=\\"96\\"')) return m;
  replaced++;
  return m
    .replace(
      'width=\\"100\\" height=\\"100\\" viewBox=\\"0 0 100 100\\"',
      'width=\\"100\\" height=\\"118\\" viewBox=\\"0 0 100 118\\"'
    )
    .replace(
      'y=\\"96\\" text-anchor=\\"middle\\" font-size=\\"12\\" fill=\\"#555\\" font-weight=\\"bold\\"',
      'y=\\"110\\" text-anchor=\\"middle\\" font-size=\\"12\\" fill=\\"#555\\" font-weight=\\"bold\\"'
    );
});

console.log('scanned  ' + scanned + ' candidate SVGs');
console.log('rewrote  ' + replaced + ' SVGs with overlapping fraction labels');
console.log('left     ' + (scanned - replaced) + ' label-less SVGs untouched');

if (replaced !== 11) {
  console.error('FAILED: expected 11 replacements, got ' + replaced);
  process.exit(1);
}

fs.writeFileSync(target, out);
console.log('wrote ' + target);
