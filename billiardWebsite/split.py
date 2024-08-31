import numpy as np

def divide_parallelogram_by_divisions(corners, x_divisions, y_divisions, max_decimals_x=2, max_decimals_y=2):
    A = np.array(corners[0])
    B = np.array(corners[1])
    C = np.array(corners[2])
    D = np.array(corners[3])

    # Calculate vectors for width and height
    width_vector = (B - A) / x_divisions
    height_vector = (D - A) / y_divisions

    final_corners = [] 
    # Iterate over the grid and print the corners of each new parallelogram
    for i in range(x_divisions):
        for j in range(y_divisions):
            P1 = A + i * width_vector + j * height_vector
            P2 = P1 + width_vector
            P3 = P2 + height_vector
            P4 = P1 + height_vector
            
            # Round the coordinates to deal with floating-point issues
            P1 = np.round(P1, decimals=max_decimals_x).tolist()
            P2 = np.round(P2, decimals=max_decimals_x).tolist()
            P3 = np.round(P3, decimals=max_decimals_y).tolist()
            P4 = np.round(P4, decimals=max_decimals_y).tolist()
            
            final_corners.append([P1, P2, P3, P4])
    
    return final_corners