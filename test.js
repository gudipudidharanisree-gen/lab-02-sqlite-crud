async function testServer() {
  const response = await fetch("http://localhost:3000/books/");
  const books = await response.json();

  console.log("Final Status:", response.status);
  console.log("Total Books:", books.length);
  console.log("Final Book List:", books);
}

testServer();