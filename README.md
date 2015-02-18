LEEWGL
======

**L**ightweight-**E**ditor-**E**nvironment-**W**eb-**GL** is a javascript framework which provides an environment for a basic WebGL game engine. 
It is written using plain javascript with **no** external dependencies except for glMatrix as math library.

## Run

To run LEEWGL locally you need to set-up a webserver [eg. Apache] and open the *index.html* through the webserver.

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

## Features [planned, done]

- [x] Picking.
- [x] Transform Objects.
- [x] Movable Editor-Camera.
- [ ] Different Lights
- [ ] UI interactivity.
  - [x] Dynamic Outline.
  - [x] Dynamic Inspector.
  - [ ] Menu.
  - [ ] Statusbar.
- [x] Dynamic shaders injected by javascript.
- [x] Ajax-Calls
- [ ] Adding Components to GameObjects
- [ ] UI Styling
- [ ] Import Models / Files
- [ ] Saving / Loading
- [ ] Components
  - [x] Transform
  - [x] Custom Script
    - [ ] Highlight, snippets
  - [ ] Collider
  - [ ] Texture
- [ ] Game Camera
- [ ] Play / Pause Rendering
   
