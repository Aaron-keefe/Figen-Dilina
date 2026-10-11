import sharp from 'sharp';
const [,, src, out, l, t, w, h, scale='1'] = process.argv;
await sharp(src).extract({left:+l, top:+t, width:+w, height:+h}).resize({width: Math.round(+w*+scale)}).toFile(out);
console.log('ok');
