import sys, re, html
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset
src, page, out = sys.argv[1:4]
text = html.unescape(re.sub(r"<[^>]+>", " ", open(page, encoding="utf-8").read()))
chars = set(text)
chars |= set("0123456789０１２３４５６７８９，。、；：？！“”‘’（）《》—…·・ ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,:;!?'\"()-/&年月日天时分秒")
chars = {c for c in chars if not c.isspace() or c == " "}
f = TTFont(src)
f = instancer.instantiateVariableFont(f, {"wght": 600})
opts = subset.Options(); opts.flavor = "woff2"; opts.layout_features = ["*"]; opts.name_IDs = ["*"]
sub = subset.Subsetter(opts); sub.populate(text="".join(chars)); sub.subset(f)
opts2 = opts
subset.save_font(f, out, opts)
print(len(chars), "chars")
