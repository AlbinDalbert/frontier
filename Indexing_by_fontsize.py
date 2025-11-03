import sys
import fitz # PyMuPDF
from collections import defaultdict

font_stats = defaultdict(int)
total_chars = 0
body_font_size = None


class Node:
    def __init__(self, title, font_size):
        self.title = title
        self.font_size = font_size
        self.content = []
        self.children = []


def analyse_font_stats(doc):
    global total_chars
    for page in doc:
        blocks = page.get_text("dict")["blocks"]
        for b in blocks:
            if b['type'] == 0:
                for line in b["lines"]:
                    for span in line["spans"]:
                        font_size = round(span["size"])
                        char_count = len(span["text"])
                        font_stats[font_size] += char_count
                        total_chars += char_count
    
    global body_font_size
    for font_size, char_count in font_stats.items():
        if char_count / total_chars > 0.2:
            if body_font_size is None or font_size < body_font_size:
                body_font_size = font_size


def extract_pdf_content(doc):
    sections = []
    all_spans = []

    for page in doc:
     for block in page.get_text("dict")["blocks"]:
         for line in block.get("lines", []):
             for span in line.get("spans", []):
                 print(span["text"], span["size"])

    for page_num, page in enumerate(doc):
        blocks = page.get_text("dict")["blocks"]
        for b in blocks:
            for line in b.get("lines", []):
                for span in line.get("spans", []):
                    all_spans.append({
                        "text": span["text"].strip(),
                        "size": span["size"],
                        "page": page_num
                    })

    font_sizes = sorted(font_stats.keys(), reverse=True)
    

    root = Node("Document Root", None)
    stack = [root]

    for span in all_spans:
        text = span["text"]
        size = round(span["size"])
        if not text:
            continue
        if size > body_font_size:
            level = font_sizes.index(size)
            while len(stack) > level + 1:
                stack.pop()
            new_node = Node(text, size)
            stack[-1].children.append(new_node)
            stack.append(new_node)
        else:
            stack[-1].content.append(text)
    # print_tree(root)


def print_tree(node, level=0):
    indent = "  " * level
    title = node.title if node.title else "[No Title]"
    print(f"{indent}- {title} (size: {node.font_size})")
    
    if node.content:
        snippet = " ".join(node.content[:10])
        print(f"{indent}  Content: {snippet}...")
    
    for child in node.children:
        print_tree(child, level + 1)

if __name__ == "__main__":
    chunks = []
    if len(sys.argv) != 2:
        print("Usage: python myPy.py <pdf_file>")
    else:
        doc = fitz.open(sys.argv[1])
        analyse_font_stats(doc)
        chunks = extract_pdf_content(doc)