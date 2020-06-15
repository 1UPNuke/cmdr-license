from PIL import Image
import glob

red, green, blue = (int(input("red")), int(input("green")), int(input("blue")))
images=glob.glob("*.png")
for image in images:
    im = Image.open(image)
    width, height = im.size
    for x in range(width):
        for y in range(height):
            r,g,b,a = im.getpixel((x,y))
            im.putpixel((x,y), (red,green,blue, a))

    im.save(image.replace("-", ""))

