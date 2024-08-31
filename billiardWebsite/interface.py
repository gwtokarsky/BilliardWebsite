import tkinter as tk
from tkinter import messagebox
import pg8000
import admin
import os
from dotenv import load_dotenv
import split

# Define your functions here (simplified for example purposes)

def connect_to_db():
    try:
        load_dotenv()
        conn = pg8000.connect(
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            host=os.getenv("DB_HOST"),
            port=int(os.getenv("DB_PORT")),
            database=os.getenv("DB_NAME")
        )
        return conn
    except Exception as error:
        messagebox.showerror("Error", f"Error connecting to database: {error}")
        return None

def create_region():
    corners = []

    def add_corner():
        x = float(x_entry.get())
        y = float(y_entry.get())
        corners.append((x, y))
        corners_listbox.insert(tk.END, f"({x}, {y})")
        x_entry.delete(0, tk.END)
        y_entry.delete(0, tk.END)

    def delete_corner():
        selected_indices = corners_listbox.curselection()
        if selected_indices:
            index = selected_indices[0]
            corners_listbox.delete(index)
            del corners[index]

    def submit():
        points = int(points_entry.get())
        region_color = color_entry.get()
        region_id = admin.create_region(corners, points, region_color, cursor)
        conn.commit()
        messagebox.showinfo("Success", f"Region created successfully with ID {region_id}")
        region_window.destroy()

    region_window = tk.Toplevel(root)
    region_window.title("Create Region")

    tk.Label(region_window, text="Enter number of points").grid(row=0, column=0)
    points_entry = tk.Entry(region_window)
    points_entry.grid(row=0, column=1)

    tk.Label(region_window, text="Enter X coordinate:").grid(row=1, column=0)
    x_entry = tk.Entry(region_window)
    x_entry.grid(row=1, column=1)

    tk.Label(region_window, text="Enter Y coordinate:").grid(row=2, column=0)
    y_entry = tk.Entry(region_window)
    y_entry.grid(row=2, column=1)

    add_button = tk.Button(region_window, text="Add Corner", command=add_corner)
    add_button.grid(row=3, column=1)

    # Listbox with Horizontal Scrollbar
    tk.Label(region_window, text="Corners:").grid(row=4, column=0)
    listbox_frame = tk.Frame(region_window)
    listbox_frame.grid(row=4, column=1)
    
    corners_listbox = tk.Listbox(listbox_frame, width=30, height=5, xscrollcommand=True)
    corners_listbox.pack(side=tk.LEFT)
    
    h_scrollbar = tk.Scrollbar(listbox_frame, orient=tk.HORIZONTAL)
    h_scrollbar.pack(side=tk.BOTTOM, fill=tk.X)
    
    corners_listbox.config(xscrollcommand=h_scrollbar.set)
    h_scrollbar.config(command=corners_listbox.xview)
    
    delete_button = tk.Button(region_window, text="Delete Selected", command=delete_corner)
    delete_button.grid(row=5, column=1)

    # Color Input
    tk.Label(region_window, text="Enter Region Color (HEX or Name):").grid(row=6, column=0)
    color_entry = tk.Entry(region_window)
    color_entry.grid(row=6, column=1)

    submit_button = tk.Button(region_window, text="Submit", command=submit)
    submit_button.grid(row=7, column=1)


def create_cover():
    corners = []

    def add_corner():
        x = float(x_entry.get())
        y = float(y_entry.get())
        corners.append((x, y))
        corners_listbox.insert(tk.END, f"({x}, {y})")
        x_entry.delete(0, tk.END)
        y_entry.delete(0, tk.END)

    def delete_corner():
        selected_indices = corners_listbox.curselection()
        if selected_indices:
            index = selected_indices[0]
            corners_listbox.delete(index)
            del corners[index]

    def submit():
        region_id = int(region_id_entry.get())
        admin.create_cover(corners, region_id, cursor)
        conn.commit()
        messagebox.showinfo("Success", "Cover created successfully")
        cover_window.destroy()

    cover_window = tk.Toplevel(root)
    cover_window.title("Create Cover")

    tk.Label(cover_window, text="Enter X coordinate:").grid(row=0, column=0)
    x_entry = tk.Entry(cover_window)
    x_entry.grid(row=0, column=1)

    tk.Label(cover_window, text="Enter Y coordinate:").grid(row=1, column=0)
    y_entry = tk.Entry(cover_window)
    y_entry.grid(row=1, column=1)

    add_button = tk.Button(cover_window, text="Add Corner", command=add_corner)
    add_button.grid(row=2, column=1)

    # Listbox with Horizontal Scrollbar
    tk.Label(cover_window, text="Corners:").grid(row=3, column=0)
    listbox_frame = tk.Frame(cover_window)
    listbox_frame.grid(row=3, column=1)
    
    corners_listbox = tk.Listbox(listbox_frame, width=30, height=5, xscrollcommand=True)
    corners_listbox.pack(side=tk.LEFT)
    
    h_scrollbar = tk.Scrollbar(listbox_frame, orient=tk.HORIZONTAL)
    h_scrollbar.pack(side=tk.BOTTOM, fill=tk.X)
    
    corners_listbox.config(xscrollcommand=h_scrollbar.set)
    h_scrollbar.config(command=corners_listbox.xview)
    
    delete_button = tk.Button(cover_window, text="Delete Selected", command=delete_corner)
    delete_button.grid(row=4, column=1)

    tk.Label(cover_window, text="Enter region ID:").grid(row=5, column=0)
    region_id_entry = tk.Entry(cover_window)
    region_id_entry.grid(row=5, column=1)

    submit_button = tk.Button(cover_window, text="Submit", command=submit)
    submit_button.grid(row=6, column=1)

def select_all_regions():
    regions = admin.select_all_regions(cursor)
    region_info = "\n\n".join([f"ID: {region[0]}, Points: {region[1]}, Color: {region[2]}, corners: {region[3]}" for region in regions])

    region_window = tk.Toplevel(root)
    region_window.title("All Regions")

    scrollbar = tk.Scrollbar(region_window)
    scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

    region_text = tk.Text(region_window, yscrollcommand=scrollbar.set)
    region_text.insert(tk.END, region_info)
    region_text.pack(side=tk.LEFT, fill=tk.BOTH)

    scrollbar.config(command=region_text.yview)

def select_all_covers():
    covers = admin.select_all_covers(cursor)
    cover_info = "\n\n".join([f"ID: {cover[0]}, Region ID: {cover[1]}, corners: {cover[2]}" for cover in covers])

    cover_window = tk.Toplevel(root)
    cover_window.title("All Covers")

    scrollbar = tk.Scrollbar(cover_window)
    scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

    cover_text = tk.Text(cover_window, yscrollcommand=scrollbar.set)
    cover_text.insert(tk.END, cover_info)
    cover_text.pack(side=tk.LEFT, fill=tk.BOTH)

    scrollbar.config(command=cover_text.yview)

def split_and_create():
    def add_corner():
        x = float(x_entry.get())
        y = float(y_entry.get())
        corners.append((x, y))
        corners_listbox.insert(tk.END, f"({x}, {y})")
        x_entry.delete(0, tk.END)
        y_entry.delete(0, tk.END)
    
    def delete_corner():
        selected_indices = corners_listbox.curselection()
        if selected_indices:
            index = selected_indices[0]
            corners_listbox.delete(index)
            del corners[index]
    
    def submit():
        x = int(x_cut.get())
        y = int(y_cut.get())
        x_d = int(x_decimals.get())
        y_d = int(y_decimals.get())
        chunks = split.divide_parallelogram_by_divisions(corners, x, y, x_d, y_d)
        for chunk in chunks:
            admin.create_cover(chunk, int(region_id_entry.get()), cursor)

            conn.commit()

        
    
    split_window = tk.Toplevel(root)
    split_window.title("Split Parallelogram")

    tk.Label(split_window, text="Enter X coordinate:").grid(row=0, column=0)
    x_entry = tk.Entry(split_window)
    x_entry.grid(row=0, column=1)

    tk.Label(split_window, text="Enter Y coordinate:").grid(row=1, column=0)
    y_entry = tk.Entry(split_window)
    y_entry.grid(row=1, column=1)

    add_button = tk.Button(split_window, text="Add Corner", command=add_corner)
    add_button.grid(row=4, column=1)

    # Listbox with Horizontal Scrollbar
    tk.Label(split_window, text="Corners:").grid(row=5, column=0)
    listbox_frame = tk.Frame(split_window)
    listbox_frame.grid(row=5, column=1)

    corners_listbox = tk.Listbox(listbox_frame, width=30, height=5, xscrollcommand=True)
    corners_listbox.pack(side=tk.LEFT)

    h_scrollbar = tk.Scrollbar(listbox_frame, orient=tk.HORIZONTAL)
    h_scrollbar.pack(side=tk.BOTTOM, fill=tk.X)

    corners_listbox.config(xscrollcommand=h_scrollbar.set)
    h_scrollbar.config(command=corners_listbox.xview)

    delete_button = tk.Button(split_window, text="Delete Selected", command=delete_corner)
    delete_button.grid(row=6, column=1)

    tk.Label(split_window, text="Enter number to split width:").grid(row=7, column=0)
    x_cut = tk.Entry(split_window)
    x_cut.grid(row=7, column=1)

    tk.Label(split_window, text="Enter number to split height:").grid(row=8, column=0)
    y_cut = tk.Entry(split_window)
    y_cut.grid(row=8, column=1)

    tk.Label(split_window, text="Enter region ID:").grid(row=11, column=0)
    region_id_entry = tk.Entry(split_window)
    region_id_entry.grid(row=11, column=1)

    tk.Label(split_window, text="Enter max decimals for X:").grid(row=9, column=0)
    x_decimals = tk.Entry(split_window)
    x_decimals.grid(row=9, column=1)

    tk.Label(split_window, text="Enter max decimals for Y:").grid(row=10, column=0)
    y_decimals = tk.Entry(split_window)
    y_decimals.grid(row=10, column=1)

    submit_button = tk.Button(split_window, text="Submit", command=submit)
    submit_button.grid(row=12, column=1)
    corners = []


def complete_cover():
    def submit():
        cover_id = int(cover_id_entry.get())
        username = username_entry.get()
        admin.complete_cover_manually(cover_id, username, cursor)
        conn.commit()
        messagebox.showinfo("Success", "Cover completed successfully")
        complete_window.destroy()
    
    complete_window = tk.Toplevel(root)
    complete_window.title("Complete Cover")

    tk.Label(complete_window, text="Enter Cover ID:").grid(row=0, column=0)
    cover_id_entry = tk.Entry(complete_window)
    cover_id_entry.grid(row=0, column=1)

    tk.Label(complete_window, text="Enter username:").grid(row=1, column=0)
    username_entry = tk.Entry(complete_window)
    username_entry.grid(row=1, column=1)

    submit_button = tk.Button(complete_window, text="Submit", command=submit)
    submit_button.grid(row=2, column=1)

def delete_region():
    def submit():
        region_id = int(region_id_entry.get())
        admin.delete_region(region_id, cursor)
        conn.commit()
        messagebox.showinfo("Success", "Region deleted successfully")
        delete_window.destroy()

    delete_window = tk.Toplevel(root)
    delete_window.title("Delete Region")

    tk.Label(delete_window, text="Enter Region ID:").grid(row=0, column=0)
    region_id_entry = tk.Entry(delete_window)
    region_id_entry.grid(row=0, column=1)

    submit_button = tk.Button(delete_window, text="Submit", command=submit)
    submit_button.grid(row=1, column=1)

def delete_cover():
    def submit():
        cover_id = int(cover_id_entry.get())
        admin.delete_cover(cover_id, cursor)
        conn.commit()
        messagebox.showinfo("Success", "Cover deleted successfully")
        delete_window.destroy()

    delete_window = tk.Toplevel(root)
    delete_window.title("Delete Cover")

    tk.Label(delete_window, text="Enter Cover ID:").grid(row=0, column=0)
    cover_id_entry = tk.Entry(delete_window)
    cover_id_entry.grid(row=0, column=1)

    submit_button = tk.Button(delete_window, text="Submit", command=submit)
    submit_button.grid(row=1, column=1)

def select_covers_from_region():
    def submit():
        region_id = int(region_id_entry.get())
        covers = admin.select_covers_by_region(region_id, cursor)
        print(covers)
        cover_info = "\n\n".join([f"ID: {cover[0]}, Points: {cover[1]}, corners: {cover[2]}" for cover in covers])

        cover_window = tk.Toplevel(root)
        cover_window.title("Covers from Region")

        scrollbar = tk.Scrollbar(cover_window)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        cover_text = tk.Text(cover_window, yscrollcommand=scrollbar.set)
        cover_text.insert(tk.END, cover_info)
        cover_text.pack(side=tk.LEFT, fill=tk.BOTH)

        scrollbar.config(command=cover_text.yview)

    select_window = tk.Toplevel(root)
    select_window.title("Select Covers from Region")

    tk.Label(select_window, text="Enter Region ID:").grid(row=0, column=0)
    region_id_entry = tk.Entry(select_window)
    region_id_entry.grid(row=0, column=1)

    submit_button = tk.Button(select_window, text="Submit", command=submit)
    submit_button.grid(row=1, column=1)

def change_region_corners():
    def submit():
        region_id = int(region_id_entry.get())
        corners = []
        for corner in corners_listbox.get(0, tk.END):
            x, y = corner.strip("()").split(", ")
            corners.append((float(x), float(y)))
        admin.change_region_bounds(region_id, corners, cursor)
        conn.commit()
        messagebox.showinfo("Success", "Region corners updated successfully")
        change_window.destroy()
    
    def add_corner():
        x = float(x_entry.get())
        y = float(y_entry.get())
        corners_listbox.insert(tk.END, f"({x}, {y})")
        x_entry.delete(0, tk.END)
        y_entry.delete(0, tk.END)

    def delete_corner():
        selected_indices = corners_listbox.curselection()
        if selected_indices:
            index = selected_indices[0]
            corners_listbox.delete(index)

    change_window = tk.Toplevel(root)
    change_window.title("Change Region Corners")

    tk.Label(change_window, text="Enter Region ID:").grid(row=0, column=0)
    region_id_entry = tk.Entry(change_window)
    region_id_entry.grid(row=0, column=1)

    tk.Label(change_window, text="Enter X coordinate:").grid(row=1, column=0)
    x_entry = tk.Entry(change_window)
    x_entry.grid(row=1, column=1)

    tk.Label(change_window, text="Enter Y coordinate:").grid(row=2, column=0)
    y_entry = tk.Entry(change_window)
    y_entry.grid(row=2, column=1)

    add_button = tk.Button(change_window, text="Add Corner", command=add_corner)
    add_button.grid(row=3, column=1)
    
    # Listbox with Horizontal Scrollbar
    tk.Label(change_window, text="Corners:").grid(row=4, column=0)
    listbox_frame = tk.Frame(change_window)
    listbox_frame.grid(row=4, column=1)
    
    corners_listbox = tk.Listbox(listbox_frame, width=30, height=5, xscrollcommand=True)
    corners_listbox.pack(side=tk.LEFT)

    h_scrollbar = tk.Scrollbar(listbox_frame, orient=tk.HORIZONTAL)
    h_scrollbar.pack(side=tk.BOTTOM, fill=tk.X)

    corners_listbox.config(xscrollcommand=h_scrollbar.set)
    h_scrollbar.config(command=corners_listbox.xview)

    delete_button = tk.Button(change_window, text="Delete Selected", command=delete_corner)
    delete_button.grid(row=5, column=1)
    
    submit_button = tk.Button(change_window, text="Submit", command=submit)
    submit_button.grid(row=6, column=1)

def change_cover_completion_date():
    def submit():
        cover_id = int(cover_id_entry.get())
        year = int(year_entry.get())
        month = int(month_entry.get())
        day = int(day_entry.get())
        completion_date = f"{year}-{month}-{day}"
        admin.change_completion_date(cover_id, completion_date, cursor)
        conn.commit()
        messagebox.showinfo("Success", "Cover completion date updated successfully")
        change_window.destroy()

    change_window = tk.Toplevel(root)
    change_window.title("Change Cover Completion Date")

    tk.Label(change_window, text="Enter Cover ID:").grid(row=0, column=0)
    cover_id_entry = tk.Entry(change_window)
    cover_id_entry.grid(row=0, column=1)

    tk.Label(change_window, text="Enter Year Number:").grid(row=1, column=0)
    year_entry = tk.Entry(change_window)
    year_entry.grid(row=1, column=1)

    tk.Label(change_window, text="Enter Month Number:").grid(row=2, column=0)
    month_entry = tk.Entry(change_window)
    month_entry.grid(row=2, column=1)

    tk.Label(change_window, text="Enter Day Number:").grid(row=3, column=0)
    day_entry = tk.Entry(change_window)
    day_entry.grid(row=3, column=1)

    submit_button = tk.Button(change_window, text="Submit", command=submit)
    submit_button.grid(row=4, column=1)

def make_cover_incomplete():
    def submit():
        cover_id = int(cover_id_entry.get())
        admin.make_cover_incomplete(cover_id, cursor)
        conn.commit()
        messagebox.showinfo("Success", "Cover marked as incomplete successfully")
        incomplete_window.destroy()

    incomplete_window = tk.Toplevel(root)
    incomplete_window.title("Make Cover Incomplete")

    tk.Label(incomplete_window, text="Enter Cover ID:").grid(row=0, column=0)
    cover_id_entry = tk.Entry(incomplete_window)
    cover_id_entry.grid(row=0, column=1)

    submit_button = tk.Button(incomplete_window, text="Submit", command=submit)
    submit_button.grid(row=1, column=1)

def delete_user_claims():
    def submit():
        username = username_entry.get()
        admin.delete_user_claims(username, cursor)
        conn.commit()
        messagebox.showinfo("Success", "User claims deleted successfully")
        delete_window.destroy()

    delete_window = tk.Toplevel(root)
    delete_window.title("Delete User Claims")

    tk.Label(delete_window, text="Enter Username:").grid(row=0, column=0)
    username_entry = tk.Entry(delete_window)
    username_entry.grid(row=0, column=1)

    submit_button = tk.Button(delete_window, text="Submit", command=submit)
    submit_button.grid(row=1, column=1)

def select_selected_regions():
    regions = admin.select_selected_regions(cursor)
    region_info = "\n\n".join([f"ID: {region[0]}, Points: {region[1]}, Color: {region[2]}, corners: {region[3]}" for region in regions])

    region_window = tk.Toplevel(root)
    region_window.title("Selected Regions")

    scrollbar = tk.Scrollbar(region_window)
    scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

    region_text = tk.Text(region_window, yscrollcommand=scrollbar.set)
    region_text.insert(tk.END, region_info)
    region_text.pack(side=tk.LEFT, fill=tk.BOTH)

    scrollbar.config(command=region_text.yview)

def add_selected_region():
    def submit():
        region_id = int(region_id_entry.get())
        admin.add_to_selected_regions(region_id, cursor)
        conn.commit()
        messagebox.showinfo("Success", "Region added to selected regions successfully")
        add_window.destroy()

    add_window = tk.Toplevel(root)
    add_window.title("Add Selected Region")

    tk.Label(add_window, text="Enter Region ID:").grid(row=0, column=0)
    region_id_entry = tk.Entry(add_window)
    region_id_entry.grid(row=0, column=1)

    submit_button = tk.Button(add_window, text="Submit", command=submit)
    submit_button.grid(row=1, column=1)

def remove_selected_region():
    def submit():
        region_id = int(region_id_entry.get())
        admin.delete_from_selected_regions(region_id, cursor)
        conn.commit()
        messagebox.showinfo("Success", "Region removed from selected regions successfully")
        remove_window.destroy()

    remove_window = tk.Toplevel(root)
    remove_window.title("Remove Selected Region")

    tk.Label(remove_window, text="Enter Region ID:").grid(row=0, column=0)
    region_id_entry = tk.Entry(remove_window)
    region_id_entry.grid(row=0, column=1)

    submit_button = tk.Button(remove_window, text="Submit", command=submit)
    submit_button.grid(row=1, column=1)

def select_cover_by_point():
    def submit():
        x = float(x_entry.get())
        y = float(y_entry.get())
        region_id = int(region_id_entry.get())
        cover = admin.select_cover_by_point((x,y,), region_id, cursor)
        cover_info = f"ID: {cover[0]}, Region ID: {cover[1]}, corners: {cover[2]}"

        cover_window = tk.Toplevel(root)
        cover_window.title("Cover by Point")

        cover_text = tk.Text(cover_window)
        cover_text.insert(tk.END, cover_info)
        cover_text.pack()
    
    cover_window = tk.Toplevel(root)
    cover_window.title("Select Cover by Point")

    tk.Label(cover_window, text="Enter X coordinate:").grid(row=0, column=0)
    x_entry = tk.Entry(cover_window)
    x_entry.grid(row=0, column=1)

    tk.Label(cover_window, text="Enter Y coordinate:").grid(row=1, column=0)
    y_entry = tk.Entry(cover_window)
    y_entry.grid(row=1, column=1)

    tk.Label(cover_window, text="Enter Region Id:").grid(row=2, column=0)
    region_id_entry = tk.Entry(cover_window)
    region_id_entry.grid(row=2, column=1)

    submit_button = tk.Button(cover_window, text="Submit", command=submit)
    submit_button.grid(row=3, column=1)

def select_region_by_point():
    def submit():
        x = float(x_entry.get())
        y = float(y_entry.get())
        region = admin.select_region_by_point((x,y,), cursor)
        print(region)
        region_info = f"ID: {region[0]}, Points: {region[1]}, Color: {region[2]}, corners: {region[3]}"

        region_window = tk.Toplevel(root)
        region_window.title("Region by Point")

        region_text = tk.Text(region_window)
        region_text.insert(tk.END, region_info)
        region_text.pack()
    
    region_window = tk.Toplevel(root)
    region_window.title("Select Region by Point")

    tk.Label(region_window, text="Enter X coordinate:").grid(row=0, column=0)
    x_entry = tk.Entry(region_window)
    x_entry.grid(row=0, column=1)

    tk.Label(region_window, text="Enter Y coordinate:").grid(row=1, column=0)
    y_entry = tk.Entry(region_window)
    y_entry.grid(row=1, column=1)

    submit_button = tk.Button(region_window, text="Submit", command=submit)
    submit_button.grid(row=2, column=1)


def add_flare():
    def submit():
        x = float(x_entry.get())
        y = float(y_entry.get())
        radius = float(radius_entry.get())
        title = title_entry.get()
        description = description_text.get("1.0", tk.END).strip()
        admin.add_flare(x, y, radius, description, title, cursor)
        conn.commit()
        messagebox.showinfo("Success", "Flare added successfully")
        flare_window.destroy()

    flare_window = tk.Toplevel(root)
    flare_window.title("Add Flare")

    tk.Label(flare_window, text="Enter X coordinate:").grid(row=0, column=0)
    x_entry = tk.Entry(flare_window)
    x_entry.grid(row=0, column=1)

    tk.Label(flare_window, text="Enter Y coordinate:").grid(row=1, column=0)
    y_entry = tk.Entry(flare_window)
    y_entry.grid(row=1, column=1)

    tk.Label(flare_window, text="Enter Radius:").grid(row=2, column=0)
    radius_entry = tk.Entry(flare_window)
    radius_entry.grid(row=2, column=1)

    tk.Label(flare_window, text="Enter Title:").grid(row=3, column=0)
    title_entry = tk.Entry(flare_window)
    title_entry.grid(row=3, column=1)

    # Label for the description
    tk.Label(flare_window, text="Enter Description:").grid(row=4, column=0)

    # Frame to hold the Text widget and scrollbar
    text_frame = tk.Frame(flare_window)
    text_frame.grid(row=4, column=1, padx=5, pady=5)

    # Text widget for larger input
    description_text = tk.Text(text_frame, wrap=tk.WORD, height=10, width=40)
    description_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

    # Scrollbar for the Text widget
    scrollbar = tk.Scrollbar(text_frame, command=description_text.yview)
    scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

    # Configure the Text widget to use the scrollbar
    description_text.config(yscrollcommand=scrollbar.set)

    description_entry = description_text

    submit_button = tk.Button(flare_window, text="Submit", command=submit)
    submit_button.grid(row=5, column=1)

def delete_flare():
    def submit():
        x = float(x_entry.get())
        y = float(y_entry.get())
        admin.delete_flare(x,y,cursor)
        conn.commit()
        messagebox.showinfo("Success", "Flare deleted successfully")
        delete_window.destroy()

    delete_window = tk.Toplevel(root)
    delete_window.title("Delete Flare")

    tk.Label(delete_window, text="Enter X coordinate:").grid(row=0, column=0)
    x_entry = tk.Entry(delete_window)
    x_entry.grid(row=0, column=1)

    tk.Label(delete_window, text="Enter Y coordinate:").grid(row=1, column=0)
    y_entry = tk.Entry(delete_window)
    y_entry.grid(row=1, column=1)

    submit_button = tk.Button(delete_window, text="Submit", command=submit)
    submit_button.grid(row=2, column=1)


# Main Tkinter window
root = tk.Tk()
root.title("Database Interface")

conn = connect_to_db()
cursor = conn.cursor() if conn else None


if cursor:
    create_region_button = tk.Button(root, text="Create Region", command=create_region)
    create_region_button.grid(row=0, column=0)

    create_cover_button = tk.Button(root, text="Create Cover", command=create_cover)
    create_cover_button.grid(row=1, column=0)

    select_all_regions_button = tk.Button(root, text="Select All Regions", command=select_all_regions)
    select_all_regions_button.grid(row=0, column=1)

    select_all_covers_button = tk.Button(root, text="Select All Covers", command=select_all_covers)
    select_all_covers_button.grid(row=1, column=1)

    split_and_create_button = tk.Button(root, text="Split and Create", command=split_and_create)
    split_and_create_button.grid(row=1, column=4)

    complete_cover_button = tk.Button(root, text="Complete Cover", command=complete_cover)
    complete_cover_button.grid(row=0, column=2)

    delete_region_button = tk.Button(root, text="Delete Region", command=delete_region)
    delete_region_button.grid(row=0, column=3)

    delete_cover_button = tk.Button(root, text="Delete Cover", command=delete_cover)
    delete_cover_button.grid(row=1, column=3)

    select_covers_from_region_button = tk.Button(root, text="Select Covers from Region", command=select_covers_from_region)
    select_covers_from_region_button.grid(row=2, column=1)

    change_region_corners_button = tk.Button(root, text="Change Region Corners", command=change_region_corners)
    change_region_corners_button.grid(row=3, column=3)

    change_cover_completion_date_button = tk.Button(root, text="Change Cover Completion Date", command=change_cover_completion_date)
    change_cover_completion_date_button.grid(row=0, column=4)

    make_cover_incomplete_button = tk.Button(root, text="Make Cover Incomplete", command=make_cover_incomplete)
    make_cover_incomplete_button.grid(row=1, column=2)

    delete_user_claims_button = tk.Button(root, text="Delete User Claims", command=delete_user_claims)
    delete_user_claims_button.grid(row=2, column=3)

    select_selected_regions_button = tk.Button(root, text="Select Selected Regions", command=select_selected_regions)
    select_selected_regions_button.grid(row=3, column=1)

    add_selected_region_button = tk.Button(root, text="Add Selected Region", command=add_selected_region)
    add_selected_region_button.grid(row=2, column=2)

    remove_selected_region_button = tk.Button(root, text="Remove Selected Region", command=remove_selected_region)
    remove_selected_region_button.grid(row=3, column=2)

    select_cover_by_point_button = tk.Button(root, text="Select Cover by Point", command=select_cover_by_point)
    select_cover_by_point_button.grid(row=3, column=0)

    select_region_by_point_button = tk.Button(root, text="Select Region by Point", command=select_region_by_point)
    select_region_by_point_button.grid(row=2, column=0)

    add_flare_button = tk.Button(root, text="Add Flare", command=add_flare)
    add_flare_button.grid(row=2, column=4)

    delete_flare_button = tk.Button(root, text="Delete Flare", command=delete_flare)
    delete_flare_button.grid(row=3, column=4)

root.mainloop()

if cursor:
    cursor.close()
    conn.close()

