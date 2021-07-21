echo "Building the PDF ...";
prince --no-warn-css --input-list=list.txt -o docs.pdf;

echo "Done. file(s) generated under ./"
