# AI Model Information

## Current Model: Google Nano Banana

**Model:** `google/nano-banana`
**Type:** Image Editing with Text Instructions (Part of Gemini 2.5)
**Provider:** Google (Official Replicate Model)

### What It Does

This is Google's latest image editing model integrated into Gemini 2.5. It takes:
1. **Your uploaded image**
2. **A text instruction/prompt describing the edit**

And returns:
- **A modified version of your image** based on the instruction

This model is specifically designed for precise, single-sentence image editing instructions.

### Example Prompts

#### Style Changes
- "turn it into a watercolor painting"
- "make it look like a sketch"
- "convert to oil painting style"
- "make it look like a cartoon"
- "turn into a pencil drawing"

#### Color/Lighting
- "make it black and white"
- "add a sunset"
- "make it darker"
- "add warm lighting"
- "make it more vibrant"

#### Scene Modifications
- "add snow"
- "make it winter"
- "add rain"
- "make it nighttime"
- "add fog"

#### Object Modifications
- "add flowers"
- "add a dog"
- "remove people"
- "add clouds to the sky"

### How It Works

1. **Upload** your original image
2. **Enter** an instruction like "turn it into a watercolor painting"
3. **Wait** 20-30 seconds for processing
4. **Download** your modified image

### Parameters Used

- `num_inference_steps: 20` - Quality of generation (higher = better but slower)
- `image_guidance_scale: 1.5` - How much to preserve the original image
- `guidance_scale: 7.5` - How closely to follow the text prompt

### About "nano-banana"

The original request mentioned `google/nano-banana`, but this model doesn't exist or is not publicly available on Replicate. Instead, I'm using **InstructPix2Pix**, which is:

- ✅ **Stable and reliable**
- ✅ **Image-to-image** (modifies your uploaded image)
- ✅ **Prompt-based** (follows text instructions)
- ✅ **High quality** results
- ✅ **Fast** processing (~20-30 seconds)

### Alternative Models

If you want to try other image-to-image models:

1. **Stable Diffusion Image-to-Image**
   - Model: `stability-ai/stable-diffusion-img2img`
   - Good for style transfer and modifications

2. **ControlNet**
   - Model: `jagilley/controlnet-*`
   - Good for precise control over image structure

3. **SDXL Img2Img**
   - Model: `stability-ai/sdxl`
   - Higher quality but slower

To change the model, edit the model name in `src/pages/api/generate.ts`.
