import sys
import os
from rembg import remove
from PIL import Image

files = [
    r"c:\Users\HP\Desktop\Work\React\ileSure Dir\ilesure-pwa\public\images\register_illustration_1788617130132.jpg",
    r"c:\Users\HP\Desktop\Work\React\ileSure Dir\ilesure-pwa\public\images\otp_illustration_1788617227136.jpg",
    r"c:\Users\HP\Desktop\Work\React\ileSure Dir\ilesure-pwa\public\images\login_illustration_1788617118204.jpg",
    r"c:\Users\HP\Desktop\Work\React\ileSure Dir\ilesure-pwa\public\images\forgot_password_1788617216520.jpg",
    r"c:\Users\HP\Desktop\Work\React\ileSure Dir\ilesure-pwa\public\images\ads_carousel_1788617238802.jpg",
    r"c:\Users\HP\Desktop\Work\React\ileSure Dir\ilesure-pwa\public\images\auth_choice_illustration_1788617107149.jpg"
]

for file_path in files:
    try:
        print(f"Processing {file_path}...")
        input_image = Image.open(file_path)
        output_image = remove(input_image)
        
        # Save as PNG
        out_path = file_path.replace(".jpg", ".png")
        output_image.save(out_path)
        print(f"Saved transparent image to {out_path}")
        
    except Exception as e:
        print(f"Failed to process {file_path}: {e}")
