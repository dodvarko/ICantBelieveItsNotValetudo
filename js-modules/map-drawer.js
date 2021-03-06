const canvas = require('canvas');

/**
 *
 *
 * Object for drawing the map itself onto a 1024 * 1024 canvas.
 * It's not displayed directly but used to easily paint the map image onto another canvas.
 * @constructor
 */
module.exports = function MapDrawer() {
    const mapCanvas = canvas.createCanvas(1024, 1024);
    const mapCtx = mapCanvas.getContext("2d");

    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     *
     * @param {Array<object>} layers - the data containing the map image (array of pixel offsets)
     */
    function draw(layers) {
        const freeColor = hexToRgb("#0076ff");
        const occupiedColor = hexToRgb("#333333");
        const segmentColors = [
            "#19A1A1",
            "#7AC037",
            "#DF5618",
            "#F7C841"
        ].map(function (e) {
            return hexToRgb(e);
        });

        mapCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
        const imgData = mapCtx.createImageData(mapCanvas.width, mapCanvas.height);

        if (layers && layers.length > 0) {
            layers.forEach(layer => {
                var color;
                var alpha = 255;

                switch (layer.type) {
                    case "floor":
                        color = freeColor;
                        break;
                    case "wall":
                        color = occupiedColor;
                        break;
                    case "segment":
                        color = segmentColors[((layer.metaData.segmentId - 1) % segmentColors.length)];
                        break;
                }


                if (!color) {
                    console.error("Missing color for " + layer.type);
                    color = {r: 0, g: 0, b: 0};
                }

                for (let i = 0; i < layer.pixels.length; i = i + 2) {
                    drawPixel(imgData, mapCanvas, layer.pixels[i], layer.pixels[i+1], color.r, color.g, color.b, alpha);
                }
            });
        }

        mapCtx.putImageData(imgData, 0, 0);
    }

    function drawPixel(imgData, mapCanvas, x, y, r, g, b, a) {
        const imgDataOffset = (x + y * mapCanvas.width) * 4;

        imgData.data[imgDataOffset] = r;
        imgData.data[imgDataOffset + 1] = g;
        imgData.data[imgDataOffset + 2] = b;
        imgData.data[imgDataOffset + 3] = a;
    }

    return {
        draw: draw,
        canvas: mapCanvas
    };
}