Scene illustrations for the hybrid illustration layer.

Drop original illustrations here to turn any scene into an interactive painted
screen (like the concept-art reference). Until a file exists, that scene simply
uses the 3D renderer — nothing breaks.

Filenames (referenced from src/data/scenes.ts):
  home.png        -> the landing / menu island
  <jobId>.png     -> a job scene (travelers, cox, aws, rentready, ncourt,
                     atlantic, ruralmetro, merrill)
  sigils.png      -> the Hall of Sigils
  academy.png     -> the Academy

Guidance:
  - ~16:10 aspect (e.g. 1512x945) to match the reference framing.
  - ORIGINAL art only. Leonardo (glasses, goatee, black polo) — never Link or any
    Nintendo character/item/logo. Our own "Marks", not hearts.
  - After adding an image, set its `image` path in src/data/scenes.ts and author
    hotspots. Open the app with ?calibrate in the URL, drag a box over each
    interactive element, and copy the printed {x,y,w,h} into that scene's hotspots.
  - home.png hotspots are pre-authored to the reference layout (EXPERIENCE,
    CERTIFICATIONS, SKILLS, ABOUT, CONTACT, and a Begin-the-quest area).
