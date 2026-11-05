## Prompt 1 - build

Build 'Bill Book' in the folder C:\Users\admin\Documents\Harsh Vanguard\Vscode\28. BSERC AI Projects\07-Bill-Book. It's a billing app for a small shop that I can install on my phone, made as an offline PWA (manifest, service worker, icon) that I'll host on GitHub Pages.

What to build:
1. A shop profile (name, address, phone, my UPI ID, tax %) and an item list with prices (add, edit, delete). Start with a few sample items.
2. Bills with quantity, discount (₹ or %) and tax, with correct totals in rupees and paise.
3. A UPI QR code for the exact total, made from a upi://pay link with my UPI ID, shop name and amount. Generate the QR offline with a small library file saved in the project.
4. Share a bill as an image (draw it on a canvas, use the phone's share sheet, and fall back to download).
5. Bill history with bill numbers and today's total.
Also add a tiny Node test (node test.js) that checks the totals of 5 sample bills against hand-calculated answers.

Done when: totals match hand calculation on 5 bills; it works in flight mode and old bills stay saved; a UPI app scans the QR and shows the right amount; it installs on a real phone. Explain in README how to put it on GitHub Pages and install it.

Rules: plain HTML, CSS and JavaScript with no framework and no build step. It must work fully offline: no CDN, no paid API, no login (if you need a library, save its file inside the folder). Make it look good: clear layout, readable text, buttons that say what they do, works on phone and laptop, no gradients or emojis. Keep the code short and easy to read. Add a short README.md: what it is, how to run or install it, the features, and the 'Done when' list with how to check each one. Don't run git commands and don't use the browser preview pane; I'll test it myself. First save this message word for word in prompts.md under '## Prompt 1 - build'. When you're done, reply with the file list and what I should test.
