# Image Generation Update 🎨

## Current Model: Google Nano Banana

The image generation feature now uses **Google Nano Banana**, a powerful image-to-image transformation model that can apply artistic styles and transformations to your uploaded images.

## How It Works

### API Structure
```typescript
const input = {
  prompt: "Your transformation description",
  image_input: [inputUrl.publicUrl],  // Your uploaded image
  aspect_ratio: "match_input_image",  // Keeps original aspect ratio
  output_format: "jpg"                // Output as JPEG
};

const output = await replicate.run("google/nano-banana", { input });
```

## Model Features

✅ **Image-to-Image Transformation** - Uses your uploaded image as input  
✅ **Style Transfer** - Apply artistic styles to your photos  
✅ **Natural Results** - Maintains image composition while applying changes  
✅ **Multiple Input Support** - Can handle reference images (future enhancement)  
✅ **Flexible Output** - Matches input image aspect ratio by default  

## Implementation Details

### File: `src/pages/api/generate.ts`
```typescript
const input = {
  prompt: prompt.trim(),
  image_input: [inputUrl.publicUrl],
  aspect_ratio: "match_input_image",
  output_format: "jpg"
};

output = await replicate.run("google/nano-banana", { input });
```

### Output Handling
The model returns a File object with a `.url()` method:
```typescript
if (output && typeof output.url === 'function') {
  const generatedImageUrl = output.url();
  // Fetch and process the image
}
```

## Usage Examples

### Style Transfer
- "Make it in the style of Van Gogh"
- "Convert to anime style"
- "Make it look like a Monet painting"
- "Transform into pixel art"

### Artistic Effects
- "Make it photorealistic"
- "Add dramatic lighting"
- "Make it look like a vintage photograph"
- "Convert to watercolor style"

### Scene Modifications
- "Make the scene natural"
- "Add cinematic lighting"
- "Make it look professional"
- "Enhance the colors"

## Parameters

- **`prompt`** - Description of the desired transformation
- **`image_input`** - Array of input image URLs (currently using 1 image)
- **`aspect_ratio`** - Set to `"match_input_image"` to preserve original dimensions
- **`output_format`** - Set to `"jpg"` for JPEG output

## Future Enhancements

The Nano Banana model supports multiple reference images, which could enable:
- Style transfer from a reference image
- Combining elements from multiple images
- More complex transformations

Example with multiple images:
```typescript
image_input: [
  userImageUrl,      // Main image to transform
  styleReferenceUrl  // Style reference image
]
```

## Benefits

1. ✅ **Preserves composition** - Keeps your original image structure
2. ✅ **High quality** - Google's state-of-the-art model
3. ✅ **Versatile** - Works for many style transfer tasks
4. ✅ **Fast** - Typically generates results in 20-30 seconds
5. ✅ **Flexible aspect ratio** - Maintains original image proportions

## Technical Details

**Model:** Google Nano Banana  
**Type:** Image-to-Image Transformation  
**Provider:** Replicate  
**Input:** Image URL + Text Prompt  
**Output:** Transformed JPEG image  

---

**Status:** ✅ Working with Google Nano Banana model!
