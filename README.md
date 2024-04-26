Hexagonal grid version of the classic Snake game.

Snake is a genre of action video games where the player maneuvers the end of a growing line, often themed as a snake. The player must keep the snake from colliding with both other obstacles and itself, which gets harder as the snake lengthens.

Javascript
CSS
HTML

Draw on a canvas. The coordinates for game objects are calculated in axial coordinates and only converted to cartesian coordniates when rendering is required. Axial coordinates are stored in a Map.

The gird object is determined by limiting the number of cells across and up based on the size of the viewport. A loop is then applied to determine the centre of each cell.

The snake object is initiated as an array or arrays. Index 0 is always the head, and the last index is the tip of the tail. Each nested array contains coordinates for each segment. Directions are added to the head to determine where the new head will be.

The food object is calculated by generating a random coordinate within the bounds of the grid that does not fall onto a snake segment. There can only be one food object at any given time.

A switch is used for user input via the keyboard. WEADZX correspond to the possible directions that the snake can navigate. Left and right arrow keys share the same function as the left and right buttons. Awareness of the snake's direction is necessary to turn in the correct direction. Arrow keys and buttons only allow turning by a sixth while WEADZX allow turning by both a third and a sixth. Doubling back is not allowed. A modulus operator is used to enforce the index value for the direction array.

The game ends when the head of the snake goes out of the boundries of the grid, or it's head shares a hex cell with one of it's other segments.

A true / false variable is use to determine if the head of the snake is on the same cell as the food object. This variable is used to decide if the snake should grow by one cell, or maintain it's length.

Score and highscore are displayed at the top of the canvas. While text can be rendered on the canvas, it is simpler to calculate the position of an element and then put text in it. At the start of a game, the highscore is taken from localStorage. When score exceeds highscore, it's is updated in localStorage, then the highscore is updated from localStorage. This is to ensure that information only flows in one direction.

Information on how to handle hexagonal grid systems - https://www.redblobgames.com