import sys
import pdfplumber
import re
import uuid
from collections import defaultdict


headings = {
    "Chapter": {
        "level": 1,
        "pattern": r"Chapter \d+",
        "match_mode": "strict" # can be "strict" or "loose"
    },
    "Section": {
        "level": 2,
        "pattern": r"^Section \d+(?: \(\d+/\d+\))?$",
        "match_mode": "strict"
    }
}


class Node:
    def __init__(self, title, level):
        self.title = title
        self.level = level
        self.children = []
        self.content = []


def extract_pdf_content_to_chunks(text):

    root = create_dom(text)

    chunks = []
    if root.content:
        new_chunk = {
            "id": 0,
            "title": "root",
            "content": " ".join(root.content),
            "heading_path": "ROOT",
            "included_titles": [root.title] if root.title != "ROOT" else []
        }
        chunks.append(new_chunk)

    chunks.extend(split_node(root))

    # print_chunks(chunks)
    # print_tree(root)
    
    return chunks


# recursively split node content into chunks based on word count and sematnic structure
def split_node(node, min_words=350, max_words=500, parent_headings=None):
    if parent_headings is None:
        parent_headings = []

    chunks = []
    total_words = count_words(node)

    heading_path = get_heading_path(node)

    def make_chunk(text, include_all=True):
        return {
            "id": str(uuid.uuid4()),
            "title": node.title or "Untitled",
            "content": text,
            "heading_path": heading_path,
            "included_titles": collect_titles(node) if include_all else [node.title]
        }
    
    if total_words <= max_words:
        chunks.append(make_chunk(" ".join(collect_text(node))))
        return chunks

    # if too big, split into sub sections
    for child in node.children:
        chunks.extend(split_node(child, min_words, max_words, parent_headings + [node.title]))


    # if still too big and no subsections left, split by sentence
    if not node.children:
        text = " ".join(node.content)
        sentences = re.split(r'(?<=[.?!])\s+', text)
        current = []

        current_words = 0
        for s in sentences:
            current.append(s)
            current_words += len(s.split())
            if current_words >= max_words:
                chunks.append(make_chunk(" ".join(current)))
                current = []
                current_words = 0
        if current:
            chunks.append(make_chunk(" ".join(current)))

    return chunks

## utils for split ##

def collect_text(node):
    # parts = [node.title+":"] if node.title != "ROOT" else []
    parts = node.content
    for child in node.children:
        parts.extend(collect_text(child))
    return parts


def collect_titles(node):
    titles = []
    if node.title and node.title != "ROOT":
        titles.append(node.title)
    for child in node.children:
        titles.extend(collect_titles(child))
    return titles


def get_heading_path(node):
    path = []
    while node and node.title != "ROOT":
        path.append(node.title)
        node = getattr(node, "parent", None)
    return " - ".join(reversed(path)) if path else "ROOT"


def count_words(node):
    return len(" ".join(node.content).split()) + sum(count_words(child) for child in node.children)

## dom creation ##

def create_dom(text):
    global headings
    root = Node("Document Root", 0)
    stack = [root]
    pre_heading_content = []

    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        
        if pre_heading_content:
            root.content.extend(pre_heading_content)
            pre_heading_content = []

        matched = None
        for keyword, config in headings.items():
            pattern = config["pattern"]
            mode = config.get("match_mode", "strict")

            if mode == "strict":
                if re.fullmatch(pattern, line.strip()):
                    matched = (keyword, config["level"])
                    break
            else:  # loose mode
                if re.search(pattern, line):
                    matched = (keyword, config["level"])
                    break

        if matched:
            _, level = matched
            while len(stack) > level:
                stack.pop()
            new_node = Node(line, level)
            new_node.parent = stack[-1]
            stack[-1].children.append(new_node)
            stack.append(new_node)
        else:
            if len(stack) == 1:
                pre_heading_content.append(line)
            else:
                stack[-1].content.append(line)

    return root

## debug and general utils ##

def extract_text(pdf_path):
    all_text = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                all_text.append(text)
    return "\n".join(all_text)


def print_tree(node, level=0):
    indent = "  " * level
    title = node.title if node.title else "[No Title]"
    print(f"{indent}- {title} (size: {node.level})")
    
    if node.content:
        snippet = " ".join(node.content[:10])
        print(f"{indent}  Content: {snippet}...")
    
    for child in node.children:
        print_tree(child, level + 1)


def print_chunks(chunks):
    print(f"Total chunks created: {len(chunks)}")
    for i, chunk in enumerate(chunks):
        print(f"--- Chunk {i+1} ---")
        content = chunk["content"]
        print(content[:100] + "..." + content[-100:])
        print(f"Heading Path: {chunk['heading_path']}")
        print(f"Included titles: {chunk['included_titles']}")


if __name__ == "__main__":
    chunks = []
    if len(sys.argv) != 2:
        print("Usage: python myPy.py <pdf_file>")
    else:
        text = extract_text(sys.argv[1])
        chunks = extract_pdf_content_to_chunks(text)