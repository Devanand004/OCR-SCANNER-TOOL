package com.ocr.scanner.util;

import java.awt.*;
import java.awt.color.ColorSpace;
import java.awt.image.*;
import java.util.Arrays;

public class ImageUtils {

    /**
     * Converts an image to grayscale using weighted luminance.
     */
    public static BufferedImage convertToGrayscale(BufferedImage source) {
        BufferedImage grayscale = new BufferedImage(source.getWidth(), source.getHeight(), BufferedImage.TYPE_BYTE_GRAY);
        Graphics2D g = grayscale.createGraphics();
        g.drawImage(source, 0, 0, null);
        g.dispose();
        return grayscale;
    }

    /**
     * Applies Otsu's thresholding for binarization (Black & White).
     */
    public static BufferedImage applyThreshold(BufferedImage source) {
        BufferedImage grayscale = (source.getType() == BufferedImage.TYPE_BYTE_GRAY) ? source : convertToGrayscale(source);
        int width = grayscale.getWidth();
        int height = grayscale.getHeight();
        
        Raster raster = grayscale.getRaster();
        int[] pixels = new int[width * height];
        raster.getPixels(0, 0, width, height, pixels);

        int threshold = calculateOtsuThreshold(pixels);

        BufferedImage binary = new BufferedImage(width, height, BufferedImage.TYPE_BYTE_BINARY);
        WritableRaster outRaster = binary.getRaster();

        for (int i = 0; i < pixels.length; i++) {
            pixels[i] = (pixels[i] > threshold) ? 255 : 0;
        }
        outRaster.setPixels(0, 0, width, height, pixels);

        return binary;
    }

    /**
     * Resizes image if it exceeds max dimensions to save memory/processing time.
     */
    public static BufferedImage resize(BufferedImage source, int maxWidth) {
        if (source.getWidth() <= maxWidth) return source;
        
        double ratio = (double) maxWidth / source.getWidth();
        int newHeight = (int) (source.getHeight() * ratio);

        Image scaled = source.getScaledInstance(maxWidth, newHeight, Image.SCALE_SMOOTH);
        BufferedImage result = new BufferedImage(maxWidth, newHeight, BufferedImage.TYPE_INT_RGB);
        
        Graphics2D g2d = result.createGraphics();
        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g2d.drawImage(scaled, 0, 0, null);
        g2d.dispose();
        
        return result;
    }

    /**
     * Simple Box Blur for noise reduction.
     */
    public static BufferedImage denoise(BufferedImage source) {
        float[] matrix = {
            1/9f, 1/9f, 1/9f,
            1/9f, 1/9f, 1/9f,
            1/9f, 1/9f, 1/9f
        };
        Kernel kernel = new Kernel(3, 3, matrix);
        ConvolveOp op = new ConvolveOp(kernel, ConvolveOp.EDGE_NO_OP, null);
        return op.filter(source, null);
    }

    private static int calculateOtsuThreshold(int[] pixels) {
        int[] histogram = new int[256];
        for (int p : pixels) histogram[p]++;

        int total = pixels.length;
        float sum = 0;
        for (int i = 0; i < 256; i++) sum += i * histogram[i];

        float sumB = 0;
        int wB = 0;
        int wF = 0;
        float varMax = 0;
        int threshold = 0;

        for (int i = 0; i < 256; i++) {
            wB += histogram[i];
            if (wB == 0) continue;
            wF = total - wB;
            if (wF == 0) break;

            sumB += (float) (i * histogram[i]);
            float mB = sumB / wB;
            float mF = (sum - sumB) / wF;

            float varBetween = (float) wB * (float) wF * (mB - mF) * (mB - mF);

            if (varBetween > varMax) {
                varMax = varBetween;
                threshold = i;
            }
        }
        return threshold;
    }
}
