 import { NativeScriptConfig } from '@nativescript/core'

export default {
  id: 'com.flyingbricksoftware.MapboxAngularDemo',
  appResourcesPath: 'App_Resources',
  android: {
    v8Flags: '--expose_gc',
    markingMode: 'none',
  },
  appPath: 'src',
} as NativeScriptConfig
