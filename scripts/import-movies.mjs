// One-off public catalog import. Run manually: node scripts/import-movies.mjs
import fs from 'node:fs/promises';
const source = 'https://m.touchcinema.com/phim';
const html = await (await fetch(source)).text();
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const items = [...html.matchAll(/<div class="movie-item"[\s\S]*?<a href="([^"]+)"[\s\S]*?<img src="([^"]+)" alt="([^"]+)"[\s\S]*?Khởi chiếu: <b>([^<]+)<\/b>/g)].slice(0,10);
if (items.length !== 10) throw new Error('Source layout changed: expected ten movies');
const movies=[];
await fs.mkdir('apps/web/public/movies', {recursive:true});
for (const [i,item] of items.entries()) {
 const [,url,poster,title,date]=item;
 const detail=await (await fetch(url)).text();
 const duration=Number(detail.match(/Thời lượng:<br\s*\/>\s*(\d+)/)?.[1]);
 if(!duration) throw new Error(`Missing duration: ${title}`);
 const genres=decode(detail.match(/Thể loại:<br\s*\/>\s*([\s\S]*?)<\/div>/)?.[1]||'').split(',').map(s=>s.trim());
 const [day,month,year]=date.split('/');
 const releaseDate=`${year}-${month}-${day}`;
 const image=await fetch(poster); if(!image.ok) throw new Error('Poster unavailable');
 const posterUrl=`/movies/${url.split('/').pop()}.jpg`;
 await fs.writeFile('apps/web/public'+posterUrl,Buffer.from(await image.arrayBuffer()));
 movies.push({id:`movie-${i+1}`,title:decode(title),synopsis:`${genres.join(' / ')} · Khởi chiếu ${date}.`,durationMinutes:duration,genres,posterUrl,releaseDate,status: releaseDate > '2026-11-19' ? 'coming_soon' : 'now_showing',sourceUrl:url,sourcePosterUrl:poster,importedAt:new Date().toISOString()});
 console.log(title,duration,releaseDate);
}
await fs.writeFile('apps/web/src/mocks/movies.json',JSON.stringify(movies,null,2)+'\n');
