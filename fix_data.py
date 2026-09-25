import os

with open('data.js', 'rb') as f:
    content = f.read()

content = content.replace(b'\x95', b'\xe2\x80\xa2')

text = content.decode('utf-8', errors='ignore')

bt = chr(96)
text = text.replace('longDescription: "This standalone', 'longDescription: ' + bt + 'This standalone')
text = text.replace('framework coverage."', 'framework coverage.' + bt + ',')

with open('data.js', 'w', encoding='utf-8') as f:
    f.write(text)
