/**
 * @constructor
 * @augments LEEWGL.GameObject
 * @param  {} options
 */
LEEWGL.Text = function(options) {
  LEEWGL.GameObject.call(this, options);

  this.options = {
    'canvas': document.createElement('canvas'),
    'context': null,
    'text-color': '#333',
    'background-color': '#fff',
    'alignment': 'center',
    'baseline': 'middle',
    'fontsize': '40px',
    'fontfamily': 'serif'
  };

  extend(LEEWGL.Text.prototype, LEEWGL.Options.prototype);

  this.setOptions(options);

  var _gl = null;
  var _context = this.options.context;
  var _canvas = this.options.canvas;

  try {
    _gl = _context || _canvas.getContext('2d');
    if (_gl === null) {
      if (_canvas.getContext('2d') === null) {
        throw 'Error creating WebGL context with selected attributes.';
      } else {
        throw 'Error creating WebGL context.';
      }
    }
  } catch (error) {
    console.error(error);
  }

  this.context = _gl;
  this.canvas = _canvas;

  this.texture = new LEEWGL.Texture();
};

LEEWGL.Text.prototype = Object.create(LEEWGL.GameObject.prototype);

LEEWGL.Text.prototype.createTexture = function(gl) {
  this.texture.create(gl);
  this.texture.setTextureCanvas(gl, this.options.canvas);
};

LEEWGL.Text.prototype.createMultilineText = function(textToWrite, maxWidth, outText) {
  textToWrite = textToWrite.replace('\n', ' ');
  var currentText = textToWrite;

  var futureText;
  var subWidth = 0;
  var maxLineWidth = 0;

  var wordArray = textToWrite.split(" ");
  var wordsInCurrent, wordArrayLength;
  wordsInCurrent = wordArrayLength = wordArray.length;

  while (this.context.measureText(currentText).width > maxWidth && wordsInCurrent > 1) {
    wordsInCurrent--;
    var linebreak = false;

    currentText = futureText = "";
    for (var i = 0; i < wordArrayLength; i++) {
      if (i < wordsInCurrent) {
        currentText += wordArray[i];
        if (i + 1 < wordsInCurrent) {
          currentText += " ";
        }
      } else {
        futureText += wordArray[i];
        if (i + 1 < wordArrayLength) {
          futureText += " ";
        }
      }
    }
  }
  outText.push(currentText);
  maxLineWidth = this.context.measureText(currentText).width;

  if (futureText) {
    subWidth = this.createMultilineText(futureText, maxWidth, outText);
    if (subWidth > maxLineWidth) {
      maxLineWidth = subWidth;
    }
  }
  return maxLineWidth;
};

LEEWGL.Text.prototype.renderData = function() {
  return {
    'uniforms': {
      'uSampler': this.texture.texture.id
    }
  };
};

LEEWGL.Text.prototype.draw = function(textToWrite, maxWidth) {
  this.context.textAlign = this.options.alignment;
  this.context.textBaseline = this.options.baseline;
  this.context.font = this.options.fontsize + ' ' + this.options.fontfamily;

  var canvasX, canvasY, textX, textY;
  var textSize = parseInt(this.options.fontsize);
  var width = getPowerOfTwo(this.context.measureText(textToWrite).width);
  var height = getPowerOfTwo(2 * textSize);
  var text = [];

  if (this.context.measureText(textToWrite).width > maxWidth) {
    maxWidth = this.createMultilineText(textToWrite, maxWidth, text);
    canvasX = getPowerOfTwo(maxWidth);
  } else {
    text.push(textToWrite);
    canvasX = getPowerOfTwo(this.context.measureText(textToWrite).width);
  }
  canvasY = getPowerOfTwo(textSize * (text.length + 1));

  this.canvas.width = canvasX;
  this.canvas.height = canvasY;

  this.context.textAlign = this.options.alignment;
  this.context.textBaseline = this.options.baseline;
  this.context.font = this.options.fontsize + ' ' + this.options.fontfamily;

  this.context.fillStyle = this.options['background-color'];
  this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

  this.context.fillStyle = this.options['text-color'];

  switch (this.options.alignment) {
    case 'left':
      textX = 0;
      break;
    case 'center':
      textX = canvasX / 2;
      break;
    case 'right':
      textX = canvasX;
      break;
  }

  textY = canvasY / 2;

  var offset = (canvasY - textSize * (text.length + 1)) * 0.5;
  for (var i = 0; i < text.length; ++i) {
    if (text.length > 1)
      textY = (i + 1) * textSize + offset;
    this.context.fillText(text[i], textX, textY);
  }
};
