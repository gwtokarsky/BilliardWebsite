import sys

def cut_parallelogram(corners, x, y):
    # Calculate the width and height of the parallelogram
    width = abs(corners[1][0] - corners[0][0])
    height = abs(corners[1][1] - corners[2][1])
    
    # Calculate the number of chunks in each dimension
    num_chunks_x = width // x
    num_chunks_y = height // y
    # Create a list to store the chunks
    chunks = []
    
    for i in range(num_chunks_x):
        # Calculate the starting x-coordinate of the current column
        start_x = corners[1][0] - i * x
        
        # Iterate over the chunks in the y direction (top to bottom)
        for j in range(num_chunks_y):
            # Calculate the starting y-coordinate of the current chunk
            start_y = corners[1][1] + i * x - j * y
            
            # Append the coordinates of the current chunk to the list
            chunks.append(((start_x - x, start_y + x * y),(start_x, start_y),(start_x, start_y - y), (start_x - x, start_y + x * y - y)))
    
    return chunks

if __name__ == '__main__':
    # Parse the input arguments
    corners = [(int(corner.split(',')[0]), int(corner.split(',')[1])) for corner in [sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]]]
    x = int(sys.argv[5])
    y = int(sys.argv[6])
    
    # Call the function and print the result
    chunks = cut_parallelogram(corners, x, y)
    for chunk in chunks:
        print(str(chunk).replace('((', '').replace('),', ' ,').replace('(','').replace(', ',',').replace(' ,', ' ').replace('))', ''))