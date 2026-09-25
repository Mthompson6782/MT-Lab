import os
import re

with open('data.js', 'r', encoding='utf-8') as f:
    text = f.read()

bt = chr(96)
# First revert my previous attempt if it was saved
text = text.replace('longDescription: ' + bt + 'This standalone', 'longDescription: "This standalone')

# Now apply proper backticks
text = text.replace('longDescription: "This standalone', 'longDescription: ' + bt + 'This standalone')
text = text.replace('context.",', 'context.' + bt + ',')

# Replace the replacement character with a proper bullet
text = text.replace('\ufffd', '•')

with open('data.js', 'w', encoding='utf-8') as f:
    f.write(text)
