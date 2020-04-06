# iOS builds errors

If you get can't find symbol MGLMapView and the like remove node_modules and platforms
from your project and rebuild. 

For reasons I have yet to figure out, linking to the src directory from a
project's package.json cause all kinds of errors. 

So build the plugin from the src directory using

```
npm run build.dist
```

and the reference 

```
file:<path_to>/nativescript-mapbox-fbs/publish/dist/package
```

in your project's package.json.

# Typings

When upgrading the underlying libraries the typings have to be re-generated. 

Remember to update the pod respositories list in case it's unable to find the
updated pod file. 
