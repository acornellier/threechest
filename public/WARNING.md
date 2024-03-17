All files in /public are configured to have max-age=31536000 in vercel.json.
This means that these files are cached forever in the browser, and any changes to them will be completely ignored.
To make a change to a file, it must also be renamed, to bust the cache. Ideally add some kind of hash.