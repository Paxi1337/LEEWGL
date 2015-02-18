LEEWGL
======

Lightweight-Editor-Environment-Web-GL is a javascript framework which provides an environment for a basic WebGL game engine. 
It is written using plain javascript with no external dependencies except for glMatrix as math library.

## Run

To run LEEWGL locally you need to set-up a webserver and open the index.html through the webserver.

## Classes

- Core.js - Creates the WebGL context, calls the app update and render routine.
- App.js - abstract class which provides onCreate, onUpdate, onRender and various input functions - gets called by LEEWGL.Core.
- Buffer.js - VertexBuffer methods.
- IndexBuffer.js - IndexBuffer methods.
- Component.js - LEEWGL uses an Unity3D-like approach to extend gameobjects by adding various components to them. 
- UI.js - Creates UI-Elements, handles UI events. 
- TestApp.js - Derivated App.js class with coded functions.
- Math.js - math helper functions which are not provided by glMatrix.
- Texture.js - Texture handling.
- ShaderLibrary.js - Dynamically loading of shaders by using ShaderChunks.
- ShaderChunk.js - Loading glsl files per ajax-calls and providing them as array-object.
- Picker.js - Enables Picking.
- Camera.js - base camera class.
- PerspectiveCamera.js - Perspective camera.
- Object3D.js - Base class of all 3D-Objects.
- Geometry.js - Collection of predefined Objects like Triangle, Cube etc.

## Current features

- Picking.
- Transform Objects.
- Movable Editor-Camera.
- UI interactivity.
- Dynamic shaders injected by javascript.
   
