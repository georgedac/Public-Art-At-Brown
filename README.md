# Public-Art-At-Brown
A website to display all public art at Brown University.

## Database structure
CREATE TABLE IF NOT EXISTS landmark (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    artists TEXT,
    yearsCreated TEXT,
    yearsInstalled TEXT,
    lat FLOAT(10,6),
    long FLOAT(10,6)
)

CREATE TABLE IF NOT EXISTS images (
    landmarkId INTEGER
    FOREIGN KEY (landmarkId) REFERENCES landmark(id) ON DELETE CASCADE
    url TEXT
)
