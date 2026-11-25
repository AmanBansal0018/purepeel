Put your real files in this folder (exact names):
 garlic.mp4      - scroll video (included): bulb -> peeled cloves -> packed in a sealed pack, white background
 pack-500g.jpg  pack-1kg.jpg  pack-5kg.jpg  pack-10kg.jpg  - real photos of your packs
Anything missing automatically falls back to the built-in illustration.
Make the video scroll-smooth:  ffmpeg -i input.mp4 -vf scale=1280:-2 -g 1 -an -movflags +faststart garlic.mp4

EASIEST OPTION (instead of the video): 4 real/AI photos on a plain white background, same angle and size:
 step1.jpg whole garlic bulb | step2.jpg bulb half peeled | step3.jpg peeled cloves | step4.jpg peeled garlic in a sealed 1 kg pack
The site cross-fades them as you scroll (and reverses on scroll up).
