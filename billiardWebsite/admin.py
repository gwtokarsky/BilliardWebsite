#import psycopg2
import os
from shapely.geometry import Polygon,Point
from dotenv import load_dotenv



# def main():
#     try:
#         load_dotenv()
#         conn = psycopg2.connect(
#             user=os.getenv("DB_USER"),
#             password=os.getenv("DB_PASSWORD"),
#             host=os.getenv("DB_HOST"),
#             port=os.getenv("DB_PORT"),
#             database=os.getenv("DB_NAME")
#         )

#         cursor = conn.cursor()
#         cursor.execute('SET search_path TO ' + os.getenv("DB_SCHEMA"))
#         conn.commit()

#         print("c to create a new cover, r to create a new region, cf to add covers from file,")
#         print("dc to delete a cover, dr to delete a region,")
#         print("o to complete a cover manually, (NOT IMPLEMENTED) x to manage cover completion requests,")
#         print("sc to select all covers, sr to select all regions, su to select all users,")
#         print("y to change cover corners,")
#         print("q to quit")

#         while True:
#             choice = input("Enter your choice: ")

#             if choice == 'r':
#                 r_input = input("Enter the points of the region: ")
#                 r_corners_string = r_input.replace(',', ' ').split(" ")
#                 try:
#                     r_corners = [(float(r_corners_string[i]), float(r_corners_string[i+1])) for i in range(0, len(r_corners_string), 2)]
#                     r_points = int(input("Enter the number of points for each cover in the region: "))
#                     color = input("Enter the color of the region: ")
#                     create_region(r_corners, r_points, color, cursor)
#                     conn.commit()
#                 except ValueError:
#                     print("Invalid input")
#             elif choice == 'c':
#                 c_input = input("Enter the points of the cover: ")
#                 c_corners_string = c_input.replace(',', ' ').split(" ")
#                 try:
#                     c_corners = [(float(c_corners_string[i]), float(c_corners_string[i+1])) for i in range(0, len(c_corners_string), 2)]
#                     region_id = int(input("Enter the region id to add the cover to: "))
#                     create_cover(c_corners, region_id, cursor)
#                     conn.commit()
#                 except ValueError:
#                     print("Invalid input")
#             elif choice == 'cf':
#                 cover_file = input("Enter the file name: ")
#                 region_id = int(input("Enter the region id to add the cover to: "))
#                 create_covers_from_file(cover_file, region_id, cursor)
#                 conn.commit()
#             elif choice == 'dc':
#                 cover_id = int(input("Enter the cover id: "))
#                 delete_cover(cover_id, cursor)
#                 conn.commit()
#             elif choice == 'dr':
#                 region_id = int(input("Enter the region id: "))
#                 delete_region(region_id, cursor)
#                 conn.commit()
#             elif choice == 'o':
#                 cover_id = int(input("Enter the cover id: "))
#                 username = input("Enter the username: ")
#                 complete_cover_manually(cover_id, username, cursor)
#                 conn.commit()
#             elif choice == 'x':
#                 #complete_cover_through_request(cursor)
#                 #conn.commit()
#                 pass
#             elif choice == 'sc':
#                 select_all_covers(cursor)
#                 conn.commit()
#             elif choice == 'sr':
#                 select_all_regions(cursor)
#                 conn.commit()
#             elif choice == 'q':
#                 cursor.close()
#                 conn.close()
#             elif choice == 'y':
#                 cover_id = int(input("Enter the cover id: "))
#                 corners_input = input("Enter the new corners: ")
#                 corners_string = corners_input.replace(',', ' ').split(" ")
#                 try:
#                     corners = [(float(corners_string[i]), float(corners_string[i+1])) for i in range(0, len(corners_string), 2)]
#                     set_new_cover_corners(cover_id, corners, cursor)
#                     conn.commit()
#                 except ValueError:
#                     print(corners_string)
#                     print("Invalid input")
#             elif choice == 'split':
#                 c_input = input("Enter the points of the cover: ")
#                 c_corners_string = c_input.replace(',', ' ').split(" ")
#                 try:
#                     corners = [(float(c_corners_string[i]), float(c_corners_string[i+1])) for i in range(0, len(c_corners_string), 2)]
#                     x = float(input("Enter the x dimension: "))
#                     y = float(input("Enter the y dimension: "))
#                     max_decimals_x = int(input("Enter the maximum number of decimals for x: "))
#                     max_decimals_y = int(input("Enter the maximum number of decimals for y: "))
#                     x = round(x, max_decimals_x)
#                     y = round(y, max_decimals_y)
#                     covers = split_cover(corners, x, y, max_decimals_x, max_decimals_y)
            
#                     for cover in covers:
#                         print(str(cover).replace('((', '').replace('),', ' ,').replace('(','').replace(', ',',').replace(' ,', ' ').replace('))', ''))
#                 except ValueError:
#                     print("Invalid input")
#             elif choice == 'scr':
#                 region_id = int(input("Enter the region id: "))
#                 select_covers_by_region(region_id, cursor)
#                 conn.commit()
#             elif choice == 'cd':
#                 cover_id = int(input("Enter the cover id: "))
#                 date = input("Enter the new date: ")
#                 change_completion_date(cover_id, date, cursor)
#                 conn.commit()
#             elif choice == 'cdanger':
#                 c_input = input("Enter the points of the cover: ")
#                 c_corners_string = c_input.replace(',', ' ').split(" ")
#                 try:
#                     c_corners = [(float(c_corners_string[i]), float(c_corners_string[i+1])) for i in range(0, len(c_corners_string), 2)]
#                     region_id = int(input("Enter the region id to add the cover to: "))
#                     create_cover(c_corners, region_id, cursor, True)
#                     conn.commit()
#                 except ValueError:
#                     print("Invalid input")
#             elif choice == 'rdanger':
#                 r_input = input("Enter the points of the region: ")
#                 r_corners_string = r_input.replace(',', ' ').split(" ")
#                 try:
#                     r_corners = [(float(r_corners_string[i]), float(r_corners_string[i+1])) for i in range(0, len(r_corners_string), 2)]
#                     r_points = int(input("Enter the number of points for each cover in the region: "))
#                     color = input("Enter the color of the region: ")
#                     create_region(r_corners, r_points, color, cursor, True)
#                     conn.commit()
#                 except ValueError:
#                     print("Invalid input")
#             elif choice == 'crb':
#                 region_id = int(input("Enter the region id: "))
#                 corners_input = input("Enter the new corners: ")
#                 corners_string = corners_input.replace(',', ' ').split(" ")
#                 try:
#                     corners = [(float(corners_string[i]), float(corners_string[i+1])) for i in range(0, len(corners_string), 2)]
#                     change_region_bounds(region_id, corners, cursor)
#                     conn.commit()
#                 except ValueError:
#                     print(corners_string)
#                     print("Invalid input")
#             elif choice == 'cdr':
#                 region_id = int(input("Enter the region id: "))
#                 date = input("Enter the new date: ")
#                 change_date_per_region(region_id, date, cursor)
#                 conn.commit()
#             else:
#                 print("Invalid input")

#     except (Exception) as error:
#         print("Error connecting to database:", error)

def create_region(corners, points, color, cursor, danger=False):
    try:
        #if not danger:
        #    polygon = Polygon(corners)
        #    validate_region(polygon, cursor)
        
        cursor.execute("INSERT INTO region (color, points) VALUES (%s, %s) RETURNING id", (color, points))
        region_id = cursor.fetchone()[0]
        for i in range(len(corners)):
            cursor.execute("INSERT INTO region_has_corner (region_id, cornerx, cornery, position) VALUES (%s, %s, %s, %s)", (region_id, corners[i][0], corners[i][1], i))
        
        
        print("Region ID:", region_id)
        print("Region created successfully")

        return region_id
   
    except (Exception) as error:
        print("Error creating region:", error)



def create_cover(corners, region_id, cursor, danger=False):
    try:
        cover = Polygon(corners)
        print(cover)

        #if not danger:
        #    validate_cover(cover, region_id, cursor)
        
        cursor.execute("SELECT points FROM region WHERE id = %s", (region_id,))
         
        region_points = cursor.fetchone()[0]
        print("Region points:", region_points)
        print("Region ID:", region_id)
         
        cursor.execute("INSERT INTO covers (points) VALUES (%s) RETURNING id", (region_points,)) 
        
        cover_id = cursor.fetchone()[0]
        
        cursor.execute("INSERT INTO cover_in_region (cover_id, region_id) VALUES (%s, %s)", (cover_id, region_id))
        print("Cover corners:", corners)
        for i in range(len(corners)):
            cursor.execute("INSERT INTO has_corner (cover_id, cornerx, cornery, position) VALUES (%s, %s, %s, %s)", (cover_id, corners[i][0], corners[i][1], i))
        
        print("Cover ID:", cover_id)
        print("Cover created successfully")
        
    except (Exception) as error:
        print("Error creating region:", error)

def create_covers_from_file( cover_file, region_id, cursor):
    try:
        cover_file = open(cover_file, "r")
        cover_lines = cover_file.readlines()
        cover_file.close()
        cover_lines = [line.strip() for line in cover_lines]
        for line in cover_lines:
            corners = line.replace(',', ' ').split(" ")
            corners = [(float(corners[i]), float(corners[i+1])) for i in range(0, len(corners), 2)]
            create_cover(corners, region_id, cursor)
    except (Exception) as error:
        print("Error creating region:", error)


def validate_cover(cover, region_id, cursor):
    try:
        cover = Polygon(cover)

        cursor.execute("SELECT cornerx,cornery FROM region_has_corner WHERE region_id = %s ORDER BY POSITION ASC", (region_id,))
        region_corners = cursor.fetchall()
        region = Polygon(region_corners)

        intersection = cover.intersection(region)
        if not intersection.equals(cover):
            raise Exception("Cover does not fit in region")
        
        cursor.execute("SELECT cover_id FROM cover_in_region WHERE region_id = %s", (region_id,))
        rows = cursor.fetchall()
        for row in rows:
            cursor.execute("SELECT cornerx,cornery FROM has_corner WHERE cover_id = %s ORDER BY POSITION ASC", (row[0],))
            region_corners = cursor.fetchall()
            polygon2 = Polygon(region_corners)
        

            intersection2 = cover.intersection(polygon2)

            # Check if the intersection is an open LineString
            if intersection2.geom_type == 'LineString' or intersection2.geom_type == 'Point' or intersection2.is_empty:
                pass
            else:
                raise Exception("Cover overlaps with existing cover")
        
    except (Exception) as error:
        print("Error creating region:", error)


def validate_region(region, cursor):
    try:        
        cursor.execute("SELECT id FROM region")
        rows = cursor.fetchall()
        for row in rows:
            cursor.execute("SELECT cornerx,cornery FROM region_has_corner WHERE region_id = %s ORDER BY POSITION ASC", (row[0],))
            region_corners = cursor.fetchall()
            polygon2 = Polygon(region_corners)
        

            intersection = region.intersection(polygon2)

            # Check if the intersection is an open LineString
            if intersection.geom_type == 'LineString' or intersection.geom_type == 'Point' or intersection.is_empty:
                pass
            else:
                raise Exception("Region overlaps with existing region")
        
    except (Exception) as error:
        print("Error creating region:", error)

def complete_cover_manually(cover_id, username, cursor):
    try:
        cursor.execute("SELECT id FROM covers WHERE id = %s", (cover_id,))
        rows = cursor.fetchone()
        if not rows:
            raise Exception("Cover does not exist")
        
        #cover cannot be already completed
        cursor.execute("SELECT cover_id FROM user_completed_cover WHERE cover_id = %s", (cover_id,))
        rows = cursor.fetchone()
        if rows:
            print("Cover already completed, replacing...")
            cursor.execute("DELETE FROM user_completed_cover WHERE cover_id = %s", (cover_id,))
        
        cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
        rows = cursor.fetchone()
        if not rows:
            raise Exception("User does not exist")
        

        cursor.execute("INSERT INTO user_completed_cover (cover_id, user_id) VALUES (%s, %s)", (cover_id, rows[0]))
        print("Cover completed successfully")
        delete_all_claimants_of_cover(cover_id, cursor)
    except (Exception) as error:
        print("Error completing cover manually:", error)

def complete_cover_through_request(cursor):
    try:
        cursor.execute("""SELECT a.cover_id, users.id, username, JSON_AGG(json_build_object(cornerx, cornery)) 
                            FROM cover_completion_request AS a Join users on user_id = users.id
                            JOIN has_corner on a.cover_id = has_corner.cover_id 
                            GROUP BY a.cover_id, users.id, username""")
        rows = cursor.fetchall()
        for row in rows:
            print("Cover ID:", row[0])
            print("Username:", row[2])
            print("Corners:", row[3])
            x = input("y to agree to completion request, n to deny, other to pass:")
            if x == 'y':
                complete_cover_manually(row[0], row[2], cursor)
                cursor.execute("DELETE FROM cover_completion_request WHERE cover_id = %s AND user_id = %s", (row[0], row[1]))
            elif x == 'n':
                print("Cover completion request denied")
                cursor.execute("DELETE FROM cover_completion_request WHERE cover_id = %s AND user_id = %s", (row[0], row[1]))
            else:
                print("Passed")
    except (Exception) as error:
        print("Error completing cover through request:", error)
    
    print("Cover completion requests completed successfully")


def delete_cover(cover_id, cursor):
    try:
        cursor.execute("SELECT id FROM covers WHERE id = %s", (cover_id,))
        rows = cursor.fetchone()
        if not rows:
            raise Exception("Cover does not exist")
        
        cursor.execute("DELETE FROM has_corner WHERE cover_id = %s", (cover_id,))
        cursor.execute("DELETE FROM cover_in_region WHERE cover_id = %s", (cover_id,))
        cursor.execute("DELETE FROM user_completed_cover WHERE cover_id = %s", (cover_id,))
        cursor.execute("DELETE FROM covers WHERE id = %s", (cover_id,))
        print("Cover deleted successfully")
    except (Exception) as error:
        print("Error deleting cover:", error)

def delete_region(region_id, cursor):
    try:
        cursor.execute("SELECT id FROM region WHERE id = %s", (region_id,))
        rows = cursor.fetchone()
        if not rows:
            raise Exception("Region does not exist")
        
        #get all covers in region and delete them
        cursor.execute("SELECT cover_id FROM cover_in_region WHERE region_id = %s", (region_id,))
        rows = cursor.fetchall()
        for row in rows:
            delete_cover(row[0], cursor)
        
        cursor.execute("DELETE FROM region_has_corner WHERE region_id = %s", (region_id,))
        cursor.execute("DELETE FROM cover_in_region WHERE region_id = %s", (region_id,))
        cursor.execute("DELETE FROM region WHERE id = %s", (region_id,))
        print("Region deleted successfully")
    except (Exception) as error:
        print("Error deleting region:", error)

def select_all_covers(cursor):
    try:
        cursor.execute("SELECT * FROM covers ORDER BY id ASC")
        rows = cursor.fetchall()
        covers = []
        for row in rows:
            print(f"ID: {row[0]}, Points: {row[1]}")
            cursor.execute("SELECT cornerx, cornery FROM has_corner WHERE cover_id = %s ORDER BY POSITION ASC", (row[0],))
            corners = cursor.fetchall()
            corners_str = ' '.join([f"{x},{y}" for x, y in corners])
            print("Corners:", corners_str)
            print()
            covers.append((row[0], row[1], corners,))
        
        return covers


    except (Exception) as error:
        print("Error selecting all covers:", error)

def select_all_regions(cursor):
    try:
        regions = []
        cursor.execute("SELECT * FROM region")
        rows = cursor.fetchall()
        for row in rows:
            print(f"ID: {row[0]}, Points: {row[1]}, Color: {row[2]}")
            cursor.execute("SELECT cornerx, cornery FROM region_has_corner WHERE region_id = %s ORDER BY POSITION ASC", (row[0],))
            corners = cursor.fetchall()
            corners = [(float(x), float(y)) for x, y in corners]
            print("Corners:", corners)
            regions.append((row[0], row[1], row[2], corners,))
        
        return regions


    except (Exception) as error:
        print("Error selecting all regions:", error)

def delete_all_claimants_of_cover(cover_id, cursor):
    try:
        count = cursor.execute("DELETE FROM user_claimed_cover WHERE cover_id = %s", (cover_id,))
    except (Exception) as error:
        print("Error deleting claimants:", error)

def set_new_cover_corners(cover_id, corners, cursor):
    try:       
        cursor.execute("DELETE FROM has_corner WHERE cover_id = %s", (cover_id,))
        for i in range(len(corners)):
            cursor.execute("INSERT INTO has_corner (cover_id, cornerx, cornery, position) VALUES (%s, %s, %s, %s)", (cover_id, corners[i][0], corners[i][1], i))
        print("Cover corners updated successfully")
    except (Exception) as error:
        print("Error updating cover corners:", error)

def split_cover(corners, x, y, max_decimals_x, max_decimals_y):
    # Calculate the width and height of the parallelogram
    width = round(abs(corners[1][0] - corners[0][0]), max_decimals_x)
    height = round(abs(corners[1][1] - corners[2][1]), max_decimals_y)
    # Calculate the number of chunks in each dimension
    num_chunks_x = round(width // x)
    num_chunks_y = round(height // y)
    # Create a list to store the chunks
    chunks = []
    for i in range(num_chunks_x):
        # Calculate the starting x-coordinate of the current column
        start_x = round(corners[1][0] - i * x, max_decimals_x)
        # Iterate over the chunks in the y direction (top to bottom)
        for j in range(num_chunks_y):
            # Calculate the starting y-coordinate of the current chunk
            start_y = round(corners[1][1] + i * x - j * y, max_decimals_y)
            # Append the coordinates of the current chunk to the list
            chunks.append(((round(start_x - x,max_decimals_x), round(start_y + x,max_decimals_y)),(start_x, start_y),(start_x, round(start_y - y,max_decimals_y)), (round(start_x - x,max_decimals_x), round(start_y + x - y,max_decimals_y))))
    
    return chunks

def change_completion_date(cover_id, date, cursor):
    try:
        cursor.execute("UPDATE user_completed_cover SET completion_date = %s WHERE cover_id = %s", (date, cover_id))
        print("Completion date updated successfully")
    except (Exception) as error:
        print("Error updating completion date:", error)

def select_covers_by_region(region_id, cursor):
    try:
        final_covers = []
        cursor.execute("SELECT * FROM covers WHERE id IN (SELECT cover_id FROM cover_in_region WHERE region_id = %s)", (region_id,))
        rows = cursor.fetchall()
        for row in rows:
            print(f"ID: {row[0]}, Points: {row[1]}")
            cursor.execute("SELECT cornerx, cornery FROM has_corner WHERE cover_id = %s ORDER BY POSITION ASC", (row[0],))
            corners = cursor.fetchall()
            corners_str = ' '.join([f"{float(x)},{float(y)}" for x, y in corners])
            print("Corners:", corners_str)
            print()

            corners = [(float(x), float(y)) for x, y in corners]

            final_covers.append((row[0], row[1], corners,))
        
        return final_covers
        
    except (Exception) as error:
        print("Error selecting covers by region:", error)   

def change_region_bounds(region_id, corners, cursor):
    try:
        cursor.execute("DELETE FROM region_has_corner WHERE region_id = %s", (region_id,))
        for i in range(len(corners)):
            cursor.execute("INSERT INTO region_has_corner (region_id, cornerx, cornery, position) VALUES (%s, %s, %s, %s)", (region_id, corners[i][0], corners[i][1], i))
        print("Region bounds updated successfully")
    except (Exception) as error:
        print("Error updating region bounds:", error)

def change_date_per_region(region_id, date, cursor):
    try:
        cursor.execute("UPDATE user_completed_cover SET completion_date = %s WHERE cover_id IN (SELECT cover_id FROM cover_in_region WHERE region_id = %s)", (date, region_id))
        print("Date updated successfully")
    except (Exception) as error:
        print("Error updating date:", error)

def make_cover_incomplete(cover_id, cursor):
    try:
        cursor.execute("DELETE FROM user_completed_cover WHERE cover_id = %s", (cover_id,))
        print("Cover made incomplete successfully")
    except (Exception) as error:
        print("Error making cover incomplete:", error)

def delete_user_claims(username, cursor):
    try:
        cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
        user_id = cursor.fetchone()[0]
        cursor.execute("DELETE FROM user_claimed_cover WHERE user_id = %s", (user_id,))
        print("User claims deleted successfully")
    except (Exception) as error:
        print("Error deleting user claims:", error)

def select_cover_by_point(point, region_id, cursor):
    try:
        #Select all covers
        cursor.execute("SELECT * FROM covers WHERE id IN (SELECT cover_id FROM cover_in_region WHERE region_id = %s)", (region_id,))
        covers = cursor.fetchall()
        for cover in covers:
            try:
                cursor.execute("SELECT cornerx, cornery FROM has_corner WHERE cover_id = %s ORDER BY POSITION ASC", (cover[0],))
                corners = cursor.fetchall()
                cover_corners = [(float(x), float(y)) for x, y in corners]
                coverp = Polygon(cover_corners)
                point = Point(point)
                if coverp.contains(point):
                    return (cover[0], cover[1], cover_corners)
            except Exception as error:
                print("Error selecting cover by point:", error)
    except (Exception) as error:
        print("Error selecting cover id by point:", error)        

def select_region_by_point(point: tuple, cursor):
    try:
        #Select all regions
        cursor.execute("SELECT * FROM region")
        regions = cursor.fetchall()
        for region in regions:
            try:
                cursor.execute("SELECT cornerx, cornery FROM region_has_corner WHERE region_id = %s ORDER BY POSITION ASC", (region[0],))
                corners = cursor.fetchall()
                region_corners = [(float(x), float(y)) for x, y in corners]
                regionp = Polygon(region_corners)
                point = Point(point)
                if regionp.contains(point):
                    return (region[0], region[1], region[2], region_corners)
            except Exception as error:
                print("Error selecting region by point:", error)
    except (Exception) as error:
        print("Error selecting region id by point:", error)

def select_all_users(cursor):
    try:
        cursor.execute("SELECT * FROM users")
        rows = cursor.fetchall()
        users = []
        for row in rows:
            print(f"ID: {row[0]}, Username: {row[1]}, Name: {row[2]}")
            users.append((row[1], row[3],))
        
        return users

    except (Exception) as error:
        print("Error selecting all users:", error)

def select_selected_regions(cursor):
    try:
        cursor.execute("SELECT * FROM region Join selected_regions on region.id = selected_regions.region")
        rows = cursor.fetchall()
        selected_regions = []
        for row in rows:
            cursor.execute("SELECT cornerx, cornery FROM region_has_corner WHERE region_id = %s ORDER BY POSITION ASC", (row[0],))
            corners = cursor.fetchall()
            corners = [(float(x), float(y)) for x, y in corners]
            selected_regions.append((row[0], row[1], row[2], corners,))
        
        return selected_regions

    except (Exception) as error:
        print("Error selecting selected regions:", error)

def add_to_selected_regions(region_id, cursor):
    try:
        cursor.execute("INSERT INTO selected_regions (region) VALUES (%s)", (region_id,))
        print("Region added to selected regions successfully")
    except (Exception) as error:
        print("Error adding region to selected regions:", error)

def delete_from_selected_regions(region_id, cursor):
    try:
        cursor.execute("DELETE FROM selected_regions WHERE region = %s", (region_id,))
        print("Region deleted from selected regions successfully")
    except (Exception) as error:
        print("Error deleting region from selected regions:", error)

def add_flare(x,y,radius,description,title,cursor):
    try:
        cursor.execute("INSERT INTO flares(x,y,radius,description,title) VALUES (%s, %s, %s, %s, %s)", (x,y,radius, description, title))
        print("Flare added successfully")
    except (Exception) as error:
        print("Error deleting region from selected regions:", error)

def delete_flare(x,y,cursor):
    try:
        cursor.execute("DELETE FROM flares WHERE x = %s AND y = %s", (x,y))
        print("Flare deleted successfully")
    except (Exception) as error:
        print("Error deleting region from selected regions:", error)

if __name__ == '__main__':
    main()