import psycopg2
import os
from shapely.geometry import Polygon
import sys
from dotenv import load_dotenv



def main():
    try:
        load_dotenv()
        conn = psycopg2.connect(
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT"),
            database=os.getenv("DB_NAME")
        )

        cursor = conn.cursor()
        cursor.execute('SET search_path TO kaiden')
        conn.commit()

        print("c to create a new cover, r to create a new region, ec to edit a cover,")
        print("er to edit a region, dc to delete a cover, dr to delete a region,")
        print("o to complete a cover, q to quit")

        while True:
            choice = input("Enter your choice: ")

            if choice == 'r':
                r_input = input("Enter the points of the region: ")
                r_corners_string = r_input.replace(',', ' ').split(" ")
                try:
                    r_corners = [(int(r_corners_string[i]), int(r_corners_string[i+1])) for i in range(0, len(r_corners_string), 2)]
                    r_points = int(input("Enter the number of points for each cover in the region: "))
                    color = input("Enter the color of the region: ")
                    create_region(r_corners, r_points, color, cursor)
                    conn.commit()
                except ValueError:
                    print("Invalid input")
            elif choice == 'c':
                c_input = input("Enter the points of the cover: ")
                c_corners_string = c_input.replace(',', ' ').split(" ")
                try:
                    c_corners = [(int(c_corners_string[i]), int(c_corners_string[i+1])) for i in range(0, len(c_corners_string), 2)]
                    region_id = int(input("Enter the region id to add the cover to: "))
                    create_cover(c_corners, region_id, cursor)
                    conn.commit()
                except ValueError:
                    print("Invalid input")
            elif choice == 'cf':
                cover_file = input("Enter the file name: ")
                region_id = int(input("Enter the region id to add the cover to: "))
                create_covers_from_file(cover_file, region_id, cursor)
                conn.commit()

            elif choice == 'q':
                cursor.close()
                conn.close()
                break
            else:
                print("Invalid input")

    except (Exception, psycopg2.DatabaseError) as error:
        print("Error connecting to database:", error)

def create_region(corners, points, color, cursor):
    try:
        polygon = Polygon(corners)
        
        validate_region(polygon, cursor)
        
        cursor.execute("INSERT INTO region (color, points) VALUES (%s, %s) RETURNING id", (color, points))
        region_id = cursor.fetchone()[0]
        for i in range(len(corners)):
            cursor.execute("INSERT INTO region_has_corner (region_id, cornerx, cornery, position) VALUES (%s, %s, %s, %s)", (region_id, corners[i][0], corners[i][1], i))
        
        
        print("Region ID:", region_id)
        print("Region created successfully")
   
   
    except (Exception, psycopg2.DatabaseError) as error:
        print("Error creating region:", error)



def create_cover(corners, region_id, cursor):
    try:
        cover = Polygon(corners)

        validate_cover(cover, region_id, cursor)
        
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
        
    except (Exception, psycopg2.DatabaseError) as error:
        print("Error creating region:", error)

def create_covers_from_file( cover_file, region_id, cursor):
    try:
        cover_file = open(cover_file, "r")
        cover_lines = cover_file.readlines()
        cover_file.close()
        cover_lines = [line.strip() for line in cover_lines]
        for line in cover_lines:
            corners = line.replace(',', ' ').split(" ")
            corners = [(int(corners[i]), int(corners[i+1])) for i in range(0, len(corners), 2)]
            create_cover(corners, region_id, cursor)
    except (Exception, psycopg2.DatabaseError) as error:
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
        
    except (Exception, psycopg2.DatabaseError) as error:
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
        
    except (Exception, psycopg2.DatabaseError) as error:
        print("Error creating region:", error)

main()