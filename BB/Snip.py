import sys
import os
from PyQt5.QtWidgets import QApplication, QMainWindow, QLabel, QRubberBand
from PyQt5.QtGui import QPixmap, QScreen
from PyQt5.QtCore import QRect, QPoint

class SnippingTool(QMainWindow):
    def __init__(self, save_path):
        super().__init__()

        self.save_path = save_path
        self.setWindowTitle("Snipping Tool")
        self.setGeometry(100, 100, 800, 600)

        # Take a full-screen screenshot
        self.screen = QApplication.primaryScreen()
        self.screenshot = self.screen.grabWindow(0)

        # Display the screenshot as a QLabel background
        self.label = QLabel(self)
        self.label.setPixmap(self.screenshot)
        self.label.setGeometry(0, 0, self.screenshot.width(), self.screenshot.height())

        # Initialize selection area
        self.rubberBand = QRubberBand(QRubberBand.Rectangle, self)
        self.start_point = QPoint()
        self.end_point = QPoint()

        self.showFullScreen()  # Show full screen for snipping

    def mousePressEvent(self, event):
        """Start selection when mouse is clicked."""
        self.start_point = event.pos()
        self.rubberBand.setGeometry(QRect(self.start_point, self.start_point))
        self.rubberBand.show()

    def mouseMoveEvent(self, event):
        """Adjust selection rectangle while dragging."""
        self.rubberBand.setGeometry(QRect(self.start_point, event.pos()).normalized())

    def mouseReleaseEvent(self, event):
        """Snip the selected area when mouse is released."""
        self.end_point = event.pos()
        self.capture_snip()

    def capture_snip(self):
        """Save the selected region as an image."""
        rect = QRect(self.start_point, self.end_point).normalized()
        snipped_pixmap = self.screenshot.copy(rect)

        snipped_pixmap.save(self.save_path, "PNG")
        print(f"Screenshot saved at: {self.save_path}")

        self.close()  # Close the snipping tool after capturing

def run_snipping_tool():
    """Runs the snipping tool and saves the screenshot in the Flask static folder."""
    save_path = sys.argv[1] if len(sys.argv) > 1 else "snip.png"

    app = QApplication(sys.argv)
    window = SnippingTool(save_path)
    app.exec_()

if __name__ == "__main__":
    run_snipping_tool()
